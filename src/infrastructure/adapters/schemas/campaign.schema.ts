import { CampaignStatus } from "@/domain/campaign/campaign";
import { z } from "zod";


const campaignEnum = z.enum(CampaignStatus)
export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.optional(campaignEnum).default(CampaignStatus.Activa),
  sessions: z.number().default(0),
});

export type Campaign = z.infer<typeof campaignSchema>;