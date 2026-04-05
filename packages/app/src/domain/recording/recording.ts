
// ========================================
// Recording Domain Types
// ========================================

export type RecordingStatus = "recording" | "processing" | "transcribed" | "failed";

/**
 * SpeakerMapping — Maps a Discord user to a campaign character for transcript attribution.
 */
export interface SpeakerMapping {
  discordUserId: string;
  discordUsername: string;
  characterId: string | null;
  characterName: string | null;
  label: string;
  role: "player" | "dm";
}

/**
 * TranscriptionSegment — A single segment of the transcribed audio,
 * attributed to a specific speaker.
 */
export interface TranscriptionSegment {
  speakerDiscordUserId: string;
  speakerLabel: string;
  text: string;
  startTime: number;
  endTime: number;
}

// ========================================
// Recording Entity
// ========================================

export interface RecordingI {
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
  startedAt: Date;
  stoppedAt: Date | null;
  transcribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Recording implements RecordingI {
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
  startedAt: Date;
  stoppedAt: Date | null;
  transcribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(recording: RecordingI) {
    this.id = recording.id;
    this.campaignId = recording.campaignId;
    this.sessionId = recording.sessionId;
    this.status = recording.status;
    this.audioFilePath = recording.audioFilePath ?? null;
    this.durationSeconds = recording.durationSeconds ?? null;
    this.speakers = recording.speakers ?? [];
    this.transcription = recording.transcription ?? null;
    this.transcriptionProvider = recording.transcriptionProvider ?? null;
    this.transcriptionError = recording.transcriptionError ?? null;
    this.discordGuildId = recording.discordGuildId;
    this.discordChannelId = recording.discordChannelId;
    this.startedAt = recording.startedAt;
    this.stoppedAt = recording.stoppedAt ?? null;
    this.transcribedAt = recording.transcribedAt ?? null;
    this.createdAt = recording.createdAt;
    this.updatedAt = recording.updatedAt;
  }
}

// ========================================
// Validation Functions
// ========================================

const VALID_RECORDING_STATUSES: RecordingStatus[] = [
  "recording",
  "processing",
  "transcribed",
  "failed",
];

/**
 * validateSpeakerMapping — Validates a speaker mapping entry.
 * Throws on validation failure.
 */
export const validateSpeakerMapping = (
  speaker: Partial<SpeakerMapping>,
): boolean => {
  const errors: Array<string> = [];

  if (!speaker.discordUserId || speaker.discordUserId.trim() === "") {
    errors.push("El discordUserId del speaker es requerido");
  }
  if (!speaker.discordUsername || speaker.discordUsername.trim() === "") {
    errors.push("El discordUsername del speaker es requerido");
  }
  if (!speaker.label || speaker.label.trim() === "") {
    errors.push("El label del speaker es requerido");
  }
  if (!speaker.role || !["player", "dm"].includes(speaker.role)) {
    errors.push("El role del speaker debe ser 'player' o 'dm'");
  }

  if (errors.length > 0) {
    throw new Error(`Errores en el speaker mapping:\n${errors.join("\n")}`);
  }
  return true;
};

/**
 * validateRecording — Validates root-level recording fields.
 * Throws on validation failure.
 */
export const validateRecording = (
  recording: Partial<RecordingI>,
): boolean => {
  const errors: Array<string> = [];

  if (!recording.campaignId || recording.campaignId.trim() === "") {
    errors.push("El campaignId es requerido");
  }
  if (!recording.sessionId || recording.sessionId.trim() === "") {
    errors.push("El sessionId es requerido");
  }
  if (!recording.discordGuildId || recording.discordGuildId.trim() === "") {
    errors.push("El discordGuildId es requerido");
  }
  if (!recording.discordChannelId || recording.discordChannelId.trim() === "") {
    errors.push("El discordChannelId es requerido");
  }
  if (
    recording.status === null ||
    recording.status === undefined ||
    !VALID_RECORDING_STATUSES.includes(recording.status)
  ) {
    errors.push(
      `El estado de la grabación no es válido. Valores permitidos: ${VALID_RECORDING_STATUSES.join(", ")}`,
    );
  }
  if (!Array.isArray(recording.speakers)) {
    errors.push("Los speakers deben ser un array");
  }
  if (recording.status === "transcribed" && recording.transcription === null) {
    errors.push(
      "La transcripción es requerida cuando el estado es 'transcribed'",
    );
  }

  if (errors.length > 0) {
    throw new Error(`Errores en la grabación:\n${errors.join("\n")}`);
  }
  return true;
};
