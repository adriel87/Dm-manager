/**
 * dm-manager.ts
 *
 * Minimal type contracts for the DM Manager HTTP API.
 * These are copied/adapted from the DM Manager domain layer
 * (src/domain/recording/recording.ts and src/infrastructure/adapters/schemas/recording.schema.ts).
 *
 * The bot treats the DM Manager as an external HTTP service — it does NOT import
 * from the Next.js app directly. If the API contract changes, update this file.
 */

// ============================================================
// Shared
// ============================================================

export type RecordingStatus = "recording" | "processing" | "transcribed" | "failed";

/**
 * Maps a Discord user to a campaign character.
 * Used by the DM Manager to attribute transcription segments to the right character.
 */
export interface SpeakerMapping {
  discordUserId: string;
  discordUsername: string;
  characterId: string | null;
  characterName: string | null;
  /** Human-readable label shown in the transcript (e.g. "Adriel", "DM") */
  label: string;
  role: "player" | "dm";
}

/**
 * A single timestamped segment from the transcription output.
 */
export interface TranscriptionSegment {
  speakerDiscordUserId: string;
  speakerLabel: string;
  text: string;
  startTime: number;
  endTime: number;
}

// ============================================================
// Recording entity (as returned by the API)
// ============================================================

export interface Recording {
  id: string;
  campaignId: string;
  sessionId: string;
  status: RecordingStatus;
  audioFilePath: string | null;
  durationSeconds: number | null;
  speakers: SpeakerMapping[];
  transcription: TranscriptionSegment[] | null;
  transcriptionProvider: string | null;
  transcriptionError: string | null;
  discordGuildId: string;
  discordChannelId: string;
  startedAt: string;
  stoppedAt: string | null;
  transcribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// POST /api/campaign/[id]/recordings
// ============================================================

export interface StartRecordingInput {
  sessionId: string;
  discordGuildId: string;
  discordChannelId: string;
  /** Optional: pre-populate speaker list. Can be empty — DM Manager reads it from campaign settings. */
  speakers?: SpeakerMapping[];
}

export interface StartRecordingResponse extends Recording {}

// ============================================================
// PUT /api/campaign/[id]/recordings/[recordingId]/stop
// ============================================================

/**
 * Audio data map: Discord user ID → base64-encoded OGG/Opus audio buffer.
 *
 * Each value is the complete audio file for that speaker (OGG container wrapping
 * Opus-encoded frames, captured from the Discord voice channel).
 *
 * The DM Manager decodes base64 back to Buffer and saves it to local storage.
 */
export interface StopRecordingInput {
  /** Total duration of the recording in seconds. */
  durationSeconds?: number;
  /**
   * Per-speaker audio buffers encoded as base64 strings.
   * Key: Discord user ID (e.g. "123456789012345678")
   * Value: base64(OGG/Opus file bytes)
   */
  audioData: Record<string, string>;
}

export interface StopRecordingResponse extends Recording {}

// ============================================================
// POST /api/campaign/[id]/recordings/[recordingId]/transcribe
// ============================================================

export interface TranscribeRecordingInput {
  /** BCP-47 language code (default: "es"). Passed to Whisper. */
  language?: string;
}

export interface TranscribeRecordingResponse extends Recording {}

// ============================================================
// GET /api/campaign/[id]/recordings
// ============================================================

export type GetRecordingsResponse = Recording[];

// ============================================================
// Campaign (minimal — used for autocomplete in /start)
// ============================================================

export interface Campaign {
  id: string;
  name: string;
  status: string;
}

export type GetCampaignsResponse = Campaign[];
