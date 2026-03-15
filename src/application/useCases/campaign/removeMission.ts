import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * removeMission — Removes a mission from a campaign's missions array.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Call repository.removeMission
 */
export const removeMission = async (
  repository: CampaignRepository,
  campaignId: string,
  missionId: string
): Promise<boolean> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 3: Remove from repository
    const updatedCampaign = await repository.removeMission(campaignId, missionId);
    if (!updatedCampaign) {
      throw new Error("Error al eliminar misión");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
