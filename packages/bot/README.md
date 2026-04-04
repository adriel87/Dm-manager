# DM Manager Bot

Discord bot that records voice sessions and sends audio to the [DM Manager](../../README.md) for transcription.

## How it works

1. The DM runs `/dm-record start session-id:abc123` in Discord
2. The bot joins the voice channel and records each speaker's audio separately
3. The DM runs `/dm-record stop` — the bot uploads the audio to the DM Manager API
4. The DM runs `/dm-record transcribe` — the DM Manager sends the audio to Whisper and returns a transcript
5. The transcript appears in the DM Manager Play Mode view, attributed per character

## Slash commands

| Command | Description |
|---------|-------------|
| `/dm-record link campaign-id:<id>` | Save the default campaign for this server (supports autocomplete) |
| `/dm-record start session-id:<id> [campaign-id:<id>]` | Join voice channel and start recording (campaign-id supports autocomplete) |
| `/dm-record stop` | Stop recording and upload audio |
| `/dm-record transcribe [language:<code>]` | Trigger Whisper transcription |
| `/dm-record status` | Show what is being recorded right now |

## Setup

### 1. Create a Discord application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it "DM Manager Bot"
3. Go to **Bot** → click **Add Bot**
4. Copy the **Token** → this is your `DISCORD_TOKEN`
5. Go to **General Information** → copy **Application ID** → this is your `DISCORD_CLIENT_ID`
6. Go to **Bot** → enable **Server Members Intent** and **Voice State Intent**
7. Go to **OAuth2 → URL Generator** → select scopes: `bot`, `applications.commands`
8. Select bot permissions: `Connect`, `Speak`, `Use Voice Activity`
9. Copy the generated URL and open it in your browser to invite the bot to your server

### 2. Install dependencies

```bash
# From the monorepo root
npm install

# Or from this package directory
cd packages/bot && npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, DM_MANAGER_URL
```

### 4. Register slash commands

```bash
npm run deploy-commands
```

Add `DISCORD_GUILD_ID` to `.env` for instant registration during development.
Without it, commands take ~1 hour to propagate globally.

### 5. Run the bot

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

In production, the bot automatically creates `data/bot.db` (SQLite) on first run to persist guild
settings and stopped recording state across restarts.

### Alternative: Docker

```bash
# Build the image
docker build -t dm-manager-bot .

# Run with your .env file
docker run --env-file .env dm-manager-bot
```

The image is a two-stage build: TypeScript is compiled in a `builder` stage, then the production image installs ffmpeg via `apk` and copies only the compiled output and production dependencies.

## Documentation

- [`docs/audio-pipeline.md`](docs/audio-pipeline.md) — Deep explanation of how audio recording works: what is Opus, OGG, ffmpeg, per-speaker capture, and why each piece exists
- [`docs/architecture.md`](docs/architecture.md) — Bot architecture, state machine, component map
- [`docs/api-contract.md`](docs/api-contract.md) — Exact HTTP contract with the DM Manager API

## Testing

```bash
# Run all unit tests
npm test
```

Tests cover all command cores, audio components, state manager, API client, event handlers, and
the `BotDatabase` SQLite wrapper (tested with `':memory:'`).
The pattern used is **Functional Core + Imperative Shell**: pure `resolve*` functions are unit
tested; Discord shell handlers (`handle*`) are not.

143 tests across 16 files, all passing.

## Implementation phases

| Phase | Status | What it adds |
|-------|--------|--------------|
| 1 — Skeleton + API client | ✅ Done | Types, HTTP client, bot shell, command definitions |
| 2 — Slash commands (no audio) | ✅ Done | `/link`, `/status`, `/start`, `/stop`, `/transcribe` handlers + auto-stop on disconnect |
| 3 — Voice capture | ✅ Done | Per-speaker OGG/Opus recording via ffmpeg (`OpusAccumulator`, `RecordingSession`) |
| 4 — Transcription flow | ✅ Done | Transcription polling, Discord transcript formatter, `StoppedRecording` state |
| 5 — Polish | ✅ Done | Autocomplete for `campaign-id`, Dockerfile |
| 6 — Production | ✅ Done | SQLite state persistence (`data/bot.db`) via `BotDatabase` |
