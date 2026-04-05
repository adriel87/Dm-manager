import { Inventory } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const getInventory = async (
  repository: CampaignRepository,
  campaignId: string
): Promise<Inventory> => {
  const campaign = await repository.getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaña no encontrada");
  return campaign.inventory;
};
