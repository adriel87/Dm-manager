import { CampaignStatus } from "@/domain/campaign/campaign";
import { z } from "zod";

// ========================================
// Campaign Root Schema
// ========================================
const campaignEnum = z.enum([
  CampaignStatus.Activa,
  CampaignStatus.Pausada,
  CampaignStatus.Finalizada,
]);

export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.optional(campaignEnum).default(CampaignStatus.Activa),
  // sessions field removed - now managed as embedded collection
});

export type Campaign = z.infer<typeof campaignSchema>;

// ========================================
// Embedded Mission Schema
// ========================================
const typeEventSchema = z.object({
  name: z.string().min(1, "El nombre del evento es requerido"),
  difficult: z.string().min(1, "La dificultad del evento es requerida"),
});

const missionStatusEnum = z.enum(["Activa", "Pausada", "Finalizada"]);

const relatedCharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const embeddedMissionSchema = z.object({
  name: z.string().min(1, "El nombre de la misión es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  missionGuide: z.string().min(1, "La guía de la misión es requerida"),
  missionPriority: z.string().min(1, "La prioridad es requerida"),
  missionEvents: z.array(typeEventSchema).nullable().default(null),
  rewards: z.string().nullable().default(null),
  relatedCharacters: z.array(relatedCharacterSchema).nullable().default(null),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: missionStatusEnum.default("Activa"),
});

export type EmbeddedMission = z.infer<typeof embeddedMissionSchema>;

// ========================================
// Embedded Session Schema
// ========================================
export const embeddedSessionSchema = z.object({
  title: z.string().min(1, "El título de la sesión es requerido"),
  notes: z.string().min(1, "Las notas son requeridas"),
  date: z.coerce.date(),
  // sessionNumber omitted - auto-calculated server-side
  // campaignId omitted - derived from parent campaign
});

export type EmbeddedSession = z.infer<typeof embeddedSessionSchema>;

// ========================================
// Embedded Note Schema
// ========================================
const noteColorEnum = z.enum(["yellow", "blue", "green", "red", "purple", "gray"]);

export const embeddedNoteSchema = z.object({
  comment: z.string().min(1, "El comentario de la nota es requerido"),
  color: noteColorEnum.default("yellow"),
});

export type EmbeddedNoteInput = z.infer<typeof embeddedNoteSchema>;

// ========================================
// Character Reference Schema
// ========================================
const dndClassEnum = z.enum([
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
  "Blood Hunter",
  "Normal",
  "Other",
]);

export const characterRefSchema = z.object({
  id: z.string().min(1, "El ID del personaje es requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  classType: dndClassEnum,
  level: z.number().int().min(1).max(20, "El nivel debe estar entre 1 y 20"),
});

export type CharacterRef = z.infer<typeof characterRefSchema>;

// ========================================
// Group Snapshot Input Schema
// ========================================
// For API input: only ID is required, rest is fetched from GroupRepository server-side
export const groupSnapshotInputSchema = z.object({
  id: z.string().min(1, "El ID del grupo es requerido"),
  // name, members, description, snapshotAt are fetched server-side
});

export type GroupSnapshotInput = z.infer<typeof groupSnapshotInputSchema>;