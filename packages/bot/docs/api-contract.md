# API Contract — DM Manager ↔ Bot

All bot calls go to the DM Manager Next.js app. Base URL: `DM_MANAGER_URL` env variable.

---

## 1. Start recording

**When:** DM runs `/dm-record start`

```
POST /api/campaign/{campaignId}/recordings
Content-Type: application/json

{
  "sessionId": "686b2a3c1f4e9d0a12345678",
  "discordGuildId": "1234567890123456789",
  "discordChannelId": "9876543210987654321",
  "speakers": []          // optional — DM Manager reads from campaign settings if empty
}
```

**Response 201:**
```json
{
  "id": "686b2a3c1f4e9d0a87654321",
  "campaignId": "686b2a3c1f4e9d0a12345678",
  "sessionId": "...",
  "status": "recording",
  "discordGuildId": "...",
  "discordChannelId": "...",
  "speakers": [],
  "startedAt": "2025-01-15T20:30:00.000Z",
  ...
}
```

The bot stores the returned `id` as `recordingId` in `BotRecordingState`.

---

## 2. Stop recording

**When:** DM runs `/dm-record stop`

```
PUT /api/campaign/{campaignId}/recordings/{recordingId}/stop
Content-Type: application/json

{
  "durationSeconds": 3600,
  "audioData": {
    "123456789012345678": "T2dnUw...(base64 OGG/Opus file for this speaker)",
    "987654321098765432": "T2dnUw...(base64 OGG/Opus file for another speaker)"
  }
}
```

**audioData explained:**
- Key: Discord user ID string (e.g. `"123456789012345678"`)
- Value: the entire OGG/Opus audio file encoded as base64
- Only include speakers who actually spoke (users with no audio can be omitted)

**Response 200:**
```json
{
  "id": "...",
  "status": "processing",
  "stoppedAt": "2025-01-15T21:30:00.000Z",
  "durationSeconds": 3600,
  ...
}
```

**Timeout:** This request can be slow for long sessions (large base64 body). The client uses 30s timeout by default (`DM_MANAGER_TIMEOUT_MS`).

---

## 3. Transcribe

**When:** DM runs `/dm-record transcribe`

```
POST /api/campaign/{campaignId}/recordings/{recordingId}/transcribe
Content-Type: application/json

{
  "language": "es"    // optional, BCP-47 code (default: "es")
}
```

**Response 200:**
```json
{
  "id": "...",
  "status": "transcribed",
  "transcribedAt": "2025-01-15T21:35:00.000Z",
  "transcription": [
    {
      "speakerDiscordUserId": "123456789012345678",
      "speakerLabel": "Adriel",
      "text": "Intento abrir la cerradura.",
      "startTime": 125.4,
      "endTime": 127.8
    }
  ],
  ...
}
```

If transcription fails, status is `"failed"` and `transcriptionError` contains the message.

---

## 4. Get recordings (for /status)

```
GET /api/campaign/{campaignId}/recordings?sessionId={sessionId}
```

**Response 200:** array of Recording objects.

---

## Error responses

All endpoints return:
```json
{ "error": "Human-readable error message" }
```

| HTTP status | Meaning |
|-------------|---------|
| 400 | Invalid request body (Zod validation failed) |
| 500 | Internal error (recording not found, storage error, Whisper error) |

The bot should display the `error` field to the DM in Discord when a non-2xx response is received.

---

## Storage key pattern

The DM Manager stores audio files at:
```
{RECORDINGS_STORAGE_PATH}/{campaignId}/{sessionId}/{recordingId}/{discordUserId}.opus
```

Default base path: `./storage/recordings` (relative to the Next.js app root).

The file content is OGG/Opus regardless of the `.opus` extension.
