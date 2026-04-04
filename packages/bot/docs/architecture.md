# Bot Architecture

## Overview

The bot is a Node.js process that bridges Discord voice channels with the DM Manager HTTP API.

```
Discord API (WebSocket + Voice UDP)
         │
         │  discord.js / @discordjs/voice
         ▼
┌─────────────────────────────────────────────────┐
│                  DM Manager Bot                  │
│                                                  │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Slash        │    │  GuildStateManager   │   │
│  │ Commands     │◄──►│  Map<guildId, State> │   │
│  └──────────────┘    └──────────────────────┘   │
│         │                      │                 │
│         │                      │                 │
│  ┌──────▼──────┐    ┌─────────▼────────────┐   │
│  │ DM Manager  │    │  RecordingSession    │   │
│  │ HTTP Client │    │  (Phase 3)           │   │
│  └──────┬──────┘    └──────────────────────┘   │
│         │                                        │
└─────────┼────────────────────────────────────────┘
          │
          │  HTTP (JSON)
          ▼
DM Manager Next.js App (localhost:3000)
```

## Directory structure

```
packages/bot/
├── src/
│   ├── api/
│   │   └── dm-manager.client.ts    ← typed HTTP client (all API calls go here)
│   ├── audio/                      ← Phase 3 + 4
│   │   ├── OpusAccumulator.ts      ← per-user stream → OGG Buffer via ffmpeg
│   │   ├── RecordingSession.ts     ← manages all speakers in a guild
│   │   ├── poller.ts               ← polls DM Manager until recording is transcribed/failed
│   │   └── transcript.ts           ← formats TranscriptionSegment[] for Discord messages
│   ├── commands/
│   │   └── dm-record/              ← Phase 2
│   │       ├── start.ts
│   │       ├── stop.ts
│   │       ├── transcribe.ts
│   │       ├── status.ts
│   │       ├── link.ts
│   │       └── index.ts
│   ├── handlers/                   ← Phase 2
│   │   ├── interactionCreate.ts
│   │   └── voiceStateUpdate.ts
│   ├── state/                      ← Phase 2
│   │   └── GuildStateManager.ts
│   ├── types/
│   │   ├── dm-manager.ts           ← DM Manager API shapes (no import from Next.js app)
│   │   └── bot.ts                  ← internal state types
│   ├── bot.ts                      ← entry point
│   └── deploy-commands.ts          ← one-shot command registration
├── docs/
│   ├── audio-pipeline.md           ← deep explanation of audio concepts
│   ├── architecture.md             ← this file
│   └── api-contract.md             ← HTTP contract with DM Manager
├── data/
│   └── guilds.json                 ← default campaign per guild (gitignored)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## State machine

Each guild has at most one active recording state. Transitions:

```
        ┌─────────────────────────────────┐
        │           IDLE                   │
        │  (no BotRecordingState)          │
        └───────────────┬─────────────────┘
                        │ /dm-record start
                        │ → POST /recordings
                        │ → join voice channel
                        ▼
        ┌─────────────────────────────────┐
        │         RECORDING                │
        │  BotRecordingState in memory     │
        │  speakerBuffers accumulating     │
        └───────┬─────────────┬───────────┘
                │             │
  /dm-record    │             │ bot disconnected
  stop          │             │ from voice channel
  → flush       │             │ → auto-stop
  buffers       │             │
  → PUT /stop   │             │
                ▼             ▼
        ┌─────────────────────────────────┐
        │         STOPPED                  │
        │  recordingId stored              │
        │  no voice connection             │
        └───────────────┬─────────────────┘
                        │ /dm-record transcribe
                        │ → POST /transcribe
                        ▼
                      IDLE
```

## Key design decisions

### Functional Core + Imperative Shell

All command handlers are split into two functions:

- **`resolve*Command(opts)`** — pure function, no Discord imports, fully unit-tested. Receives plain data, returns a typed result object.
- **`handle*(interaction, state, client)`** — Discord shell: calls the core, performs side effects (reply, API calls, state mutations). Not unit-tested.

```typescript
// Core — pure, testable
export function resolveStopCommand(state: BotRecordingState | undefined): StopResult {
  if (!state) return { ok: false, error: 'No hay ninguna grabación activa.' }
  return { ok: true, campaignId: state.campaignId, recordingId: state.recordingId }
}

// Shell — Discord, not tested
export async function handleStop(interaction, state, client): Promise<void> {
  const result = resolveStopCommand(state.get(interaction.guildId!))
  if (!result.ok) { await interaction.reply({ content: result.error, ephemeral: true }); return }
  // ... side effects
}
```

This pattern keeps the test suite fast and deterministic — no Discord mock infrastructure needed.

### Separate repository types vs shared package

The bot treats the DM Manager as an external HTTP service. Types in `src/types/dm-manager.ts`
are manually maintained copies of the relevant shapes from the DM Manager domain layer.

This was chosen over a shared `@dm-manager/types` workspace package because:
- The type surface is small (3 request shapes, 1 response shape)
- Sharing requires build ordering and tsconfig path adjustments
- The API contract is stable; if it changes, the mismatch will surface at runtime immediately

### In-memory state (MVP)

Guild recording state is held in a `Map<guildId, BotRecordingState>` in memory.

- **Advantage**: simple, no external dependency
- **Limitation**: a bot crash loses the active `recordingId`. The recording stays in `recording`
  status in the DM Manager and must be manually cleaned up (or a `/status` command can show it).
- **Phase 6** will add SQLite persistence for crash recovery.

### TDD approach

The bot was built test-first. Each `resolve*Command` function has a corresponding test file in
`__test__/commands/` that was written before the implementation. Audio components (`OpusAccumulator`,
`RecordingSession`, `poller`, `transcript`) each have their own test file under `__test__/audio/`.
The `GuildStateManager` and HTTP client are tested under `__test__/state/` and `__test__/api/`.

Test command: `npm test` (Vitest, 116 tests across 13 files, all passing).

### Audio format (OGG/Opus, not WebM)

The DM Manager's transcription providers label audio as `audio/webm` when calling Whisper,
but the actual file content is OGG/Opus. Whisper detects the real format from file content and
accepts OGG/Opus regardless of the declared MIME type.

This means:
- The bot produces OGG/Opus (via ffmpeg remux of raw Discord Opus frames) ✅
- No transcoding needed — just container wrapping ✅
- No changes needed to the DM Manager ✅

See [`audio-pipeline.md`](./audio-pipeline.md) for the full explanation.
