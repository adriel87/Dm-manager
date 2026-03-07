import { MissionStatus } from "@/domain/mission/mission";
import { z } from "zod";

const typeEventSchema = z.object({
    name: z.string(),
    difficult: z.string(),
});

export const missionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    missionGuide: z.string(),
    missionPriority: z.string(),
    missionEvents: z.array(typeEventSchema).nullable(),
    rewards: z.string().nullable(),
    relatedCharacters: z.array(z.object({ id: z.string(), name: z.string() })).nullable(),
    status: z.nativeEnum(MissionStatus).default(MissionStatus.Activa),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});