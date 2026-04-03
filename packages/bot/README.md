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
| `/dm-record link campaign-id:<id>` | Save the default campaign for this server |
| `/dm-record start session-id:<id> [campaign-id:<id>]` | Join voice channel and start recording |
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

## Documentation

- [`docs/audio-pipeline.md`](docs/audio-pipeline.md) — Deep explanation of how audio recording works: what is Opus, OGG, ffmpeg, per-speaker capture, and why each piece exists
- [`docs/architecture.md`](docs/architecture.md) — Bot architecture, state machine, component map
- [`docs/api-contract.md`](docs/api-contract.md) — Exact HTTP contract with the DM Manager API

## Implementation phases

| Phase | Status | What it adds |
|-------|--------|--------------|
| 1 — Skeleton + API client | ✅ Done | Types, HTTP client, bot shell, command definitions |
| 2 — Slash commands (no audio) | 🔜 Next | `/link`, `/status` working; `/start`/`stop` scaffold |
| 3 — Voice capture | 🔜 | Per-speaker OGG/Opus recording via ffmpeg |
| 4 — Transcription flow | 🔜 | `/transcribe` command, end-to-end test |
| 5 — Polish | 🔜 | Autocomplete, auto-stop on disconnect, Dockerfile |
| 6 — Production | 🔜 | SQLite state persistence, chunked upload |
