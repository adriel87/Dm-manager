import { z } from "zod";

export const sessionSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().min(1).max(100),
  notes: z.string().default(""),
  sessionNumber: z.number().int().positive(),
  date: z.coerce.date(),
});
