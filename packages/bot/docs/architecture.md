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
│   │   └── dm-record/              ← Phase 2 + 5
│   │       ├── start.ts
│   │       ├── stop.ts
│   │       ├── transcribe.ts
│   │       ├── status.ts
│   │       ├── link.ts
│   │       ├── autocomplete.ts     ← Phase 5: campaign-id autocomplete
│   │       └── index.ts
│   ├── handlers/                   ← Phase 2
│   │   ├── interactionCreate.ts
│   │   └── voiceStateUpdate.ts
│   ├── state/                      ← Phase 2 + 6
│   │   ├── BotDatabase.ts          ← Phase 6: SQLite wrapper (better-sqlite3)
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
│   ├── guilds.json                 ← legacy fallback (used only when BotDatabase is absent)
│   └── bot.db                      ← Phase 6: SQLite database (gitignored, auto-created)
├── Dockerfile                      ← Phase 5: multi-stage build
├── .dockerignore
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

### What survives a bot restart (Phase 6)

| State | Persisted | How |
|-------|-----------|-----|
| `defaultCampaignId` per guild | Yes | SQLite `guild_settings` table |
| `StoppedRecording` (campaignId + recordingId) | Yes | SQLite `stopped_recordings` table |
| Active `BotRecordingState` (VoiceConnection, speaker buffers) | No | Not serializable — in-memory only |

If the bot restarts while a recording is active, the recording remains in `"recording"` status in
the DM Manager and must be manually resolved. The DM can run `/dm-record status` to inspect the
situation. Guild settings and the last stopped recording (needed for `/dm-record transcribe`) are
recovered automatically from SQLite.

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

### Autocomplete: same Functional Core + Imperative Shell split

The `campaign-id` option in `/dm-record start` and `/dm-record link` uses Discord's native
autocomplete. The handler in `src/commands/dm-record/autocomplete.ts` follows the same pattern
as all other command handlers:

- **`resolveAutocomplete(campaigns, focusedValue)`** — pure function, no Discord imports. Takes
  a list of campaigns and the current typed value; returns up to 25 `CampaignChoice` objects,
  with name-substring matches ranked before id-prefix matches.
- **`handleAutocomplete(interaction, client)`** — Discord shell: fetches campaigns from the
  DM Manager API, calls the core, responds with `interaction.respond()`. If the API call fails,
  it responds with an empty list rather than throwing — Discord shows an empty dropdown instead
  of an error.

The filtering rules applied by `resolveAutocomplete`:
1. If `focusedValue` is empty, all campaigns are returned (up to 25).
2. Campaigns whose `name` contains the input (case-insensitive) are listed first.
3. Campaigns whose `id` starts with the input (case-insensitive prefix) are appended after.

`interactionCreate.ts` routes `AutocompleteInteraction` events to `handleAutocomplete` before
reaching the slash-command dispatch logic.

### Separate repository types vs shared package

The bot treats the DM Manager as an external HTTP service. Types in `src/types/dm-manager.ts`
are manually maintained copies of the relevant shapes from the DM Manager domain layer.

This was chosen over a shared `@dm-manager/types` workspace package because:
- The type surface is small (3 request shapes, 1 response shape)
- Sharing requires build ordering and tsconfig path adjustments
- The API contract is stable; if it changes, the mismatch will surface at runtime immediately

### In-memory state (active recordings)

Active `BotRecordingState` (VoiceConnection, speaker buffers, recording ID) is held in a
`Map<guildId, BotRecordingState>` in memory. This is intentional: a `VoiceConnection` is a live
WebSocket/UDP handle that cannot be serialized or restored after a restart.

- **Limitation**: a bot crash loses the active recording state. The recording stays in `"recording"`
  status in the DM Manager and must be manually resolved.
- Guild settings and stopped recordings are persisted to SQLite (see below) and survive restarts.

### SQLite persistence for guild state (Phase 6)

`BotDatabase` (`src/state/BotDatabase.ts`) is a thin synchronous wrapper around `better-sqlite3`
that persists the two pieces of state that can survive a restart:

- **`guild_settings`**: maps `guild_id → default_campaign_id`
- **`stopped_recordings`**: maps `guild_id → { campaign_id, recording_id, stopped_at }`, so the
  DM can run `/dm-record transcribe` even after a bot restart

`GuildStateManager` accepts an optional `BotDatabase` in its constructor. When present, all
settings and stopped-recording reads/writes delegate to SQLite. When absent, the legacy
`guilds.json` + in-memory `Map` path is used (backward compatible).

In production, `bot.ts` creates the database at `data/bot.db` (relative to `process.cwd()`).
The file and its tables are created automatically on first run.

#### Why SQLite instead of JSON file

- **Atomicity**: SQLite writes are transactional. A crash mid-write leaves the previous state
  intact. A JSON file can be partially written, producing invalid JSON.
- **Concurrent access**: multiple guild events can fire simultaneously; SQLite handles concurrent
  readers/writers safely without manual locking.
- **No size concern**: guild count will never be large enough to warrant a full database server.

#### Why `better-sqlite3` (synchronous) instead of an async driver

The bot is single-threaded and event-loop driven. Async SQLite drivers add complexity (Promises,
error propagation) with no practical benefit here — all database calls are fast local file I/O.
Synchronous API keeps command handlers simpler and easier to reason about.

#### Known limitations and technical debt

- **Chunked upload**: very long recording sessions produce a large base64 body for the
  `PUT /stop` request, which can exceed the default 30s timeout. Fixing this requires chunked
  upload support in the DM Manager API — out of scope for Phase 6.
- **Active recording state**: `BotRecordingState` (VoiceConnection) is not serializable and
  cannot be recovered after a restart. This is an accepted limitation.

### TDD approach

The bot was built test-first. Each `resolve*Command` function has a corresponding test file in
`__test__/commands/` that was written before the implementation. Audio components (`OpusAccumulator`,
`RecordingSession`, `poller`, `transcript`) each have their own test file under `__test__/audio/`.
The `GuildStateManager` and HTTP client are tested under `__test__/state/` and `__test__/api/`.

Test command: `npm test` (Vitest, 143 tests across 16 files, all passing).

### Audio format (OGG/Opus, not WebM)

The DM Manager's transcription providers label audio as `audio/webm` when calling Whisper,
but the actual file content is OGG/Opus. Whisper detects the real format from file content and
accepts OGG/Opus regardless of the declared MIME type.

This means:
- The bot produces OGG/Opus (via ffmpeg remux of raw Discord Opus frames) ✅
- No transcoding needed — just container wrapping ✅
- No changes needed to the DM Manager ✅

See [`audio-pipeline.md`](./audio-pipeline.md) for the full explanation.
