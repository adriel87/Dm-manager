import { EmbeddedMission } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * getMissions — Retrieves all missions for a campaign.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Return campaign.missions
 */
export const getMissions = async (
  repository: CampaignRepository,
  campaignId: string
): Promise<EmbeddedMission[]> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Return missions
    return campaign.missions;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
