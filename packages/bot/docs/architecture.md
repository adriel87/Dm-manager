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
│   ├── audio/                      ← Phase 3
│   │   ├── OpusAccumulator.ts      ← per-user stream → OGG Buffer via ffmpeg
│   │   └── RecordingSession.ts     ← manages all speakers in a guild
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

### Audio format (OGG/Opus, not WebM)

The DM Manager's transcription providers label audio as `audio/webm` when calling Whisper,
but the actual file content is OGG/Opus. Whisper detects the real format from file content and
accepts OGG/Opus regardless of the declared MIME type.

This means:
- The bot produces OGG/Opus (via ffmpeg remux of raw Discord Opus frames) ✅
- No transcoding needed — just container wrapping ✅
- No changes needed to the DM Manager ✅

See [`audio-pipeline.md`](./audio-pipeline.md) for the full explanation.
