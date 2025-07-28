import { CampaignStatus } from "@/domain/entities/campaign";
import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(CampaignStatus).default(CampaignStatus.Activa),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional().default(() => new Date()),
});

export type Campaign = z.infer<typeof campaignSchema>;