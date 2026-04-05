import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * removeGroup — Removes the group snapshot from a campaign (sets to null).
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Call repository.removeGroup
 */
export const removeGroup = async (
  repository: CampaignRepository,
  campaignId: string
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
    const updatedCampaign = await repository.removeGroup(campaignId);
    if (!updatedCampaign) {
      throw new Error("Error al remover grupo de la campaña");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
