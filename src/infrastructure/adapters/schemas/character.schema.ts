import { AgeTypeEnum, DnDClassEnum } from "@/domain/character/character";
import z  from "zod";

export const dndEnum = z.enum(DnDClassEnum);
export const characterSchema = z.object({
    name: z.string().min(1),
    age: z.enum(AgeTypeEnum).default(AgeTypeEnum.adult),
    classType: dndEnum.default(DnDClassEnum.Normal),
    level: z.number().int().min(1).default(1),
    hitPoints: z.number().int().min(1).default(10),
    createdAt: z.date().default(() => new Date()),
    description: z.string().optional(),
    location: z.string().optional(),
    isNPC: z.boolean().optional().default(false),
    updatedAt: z.date().optional().default(undefined)
});

export type CharacterSchema = z.infer<typeof characterSchema>;