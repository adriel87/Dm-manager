import { CampaignStatus } from "@/domain/campaign/campaign";
import { z } from "zod";


const campaignEnum = z.enum(CampaignStatus)
const records = z.record(campaignEnum, z.string().optional());
export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.optional(campaignEnum).default(CampaignStatus.Activa)
});

export type Campaign = z.infer<typeof campaignSchema>;