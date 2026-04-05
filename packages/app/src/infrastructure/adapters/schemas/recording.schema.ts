import { z } from "zod";

// ========================================
// Speaker Mapping Schema
// ========================================
export const speakerMappingSchema = z.object({
  discordUserId: z.string().min(1),
  discordUsername: z.string().min(1),
  characterId: z.string().nullable().default(null),
  characterName: z.string().nullable().default(null),
  label: z.string().min(1),
  role: z.enum(["player", "dm"]),
});

export type SpeakerMappingInput = z.infer<typeof speakerMappingSchema>;

// ========================================
// Start Recording Schema — POST /recordings
// ========================================
export const startRecordingSchema = z.object({
  sessionId: z.string().min(1),
  discordGuildId: z.string().min(1),
  discordChannelId: z.string().min(1),
  speakers: z.array(speakerMappingSchema).default([]),
});

export type StartRecordingInput = z.infer<typeof startRecordingSchema>;

// ========================================
// Stop Recording Schema — PUT /recordings/{id}/stop
// ========================================
export const stopRecordingSchema = z.object({
  durationSeconds: z.number().positive().optional(),
});

export type StopRecordingInput = z.infer<typeof stopRecordingSchema>;
