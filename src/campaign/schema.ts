import { z } from "zod";

export const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["activa", "pausada", "finalizada"]).default("activa"),
  createdAt: z.date().default(() => new Date()),
});

export type Campaign = z.infer<typeof campaignSchema>;