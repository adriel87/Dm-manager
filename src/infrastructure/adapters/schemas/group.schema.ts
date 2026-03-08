import { DnDClassEnum } from "@/domain/character/character";
import { z } from "zod";

const memberSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    classType: z.nativeEnum(DnDClassEnum),
});

export const groupSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    members: z.array(memberSchema).default([]),
});

export type GroupSchema = z.infer<typeof groupSchema>;
