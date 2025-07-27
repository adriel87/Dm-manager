import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(["activa", "pausada", "finalizada"]).default("activa"),
  createdAt: z.date().default(() => new Date()),
});

export type Campaign = z.infer<typeof campaignSchema>;