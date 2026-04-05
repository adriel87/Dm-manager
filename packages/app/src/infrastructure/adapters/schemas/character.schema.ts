import { AgeTypeEnum, DnDClassEnum, DnDClassType } from "@/domain/character/character";
import z  from "zod";

// Using z.enum() with keyof typeof - works with DnDClassType
export const dndEnum = z.enum(Object.keys(DnDClassEnum) as [DnDClassType, ...DnDClassType[]]);

export const characterSchema = z.object({
    name: z.string().min(1),
    age: z.enum(AgeTypeEnum).default(AgeTypeEnum.adult),
    classType: dndEnum.default('Normal'),
    level: z.number().int().min(1).default(1),
    hitPoints: z.number().int().min(1).default(10),
    createdAt: z.date().default(() => new Date()),
    description: z.string().optional(),
    location: z.string().optional(),
    isNPC: z.boolean().optional().default(false),
    playerName: z.string().optional(),
    updatedAt: z.date().optional().default(undefined)
});

export type CharacterSchema = z.infer<typeof characterSchema>;