import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * removeCharacter — Removes a character reference from a campaign.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Call repository.removeCharacter
 */
export const removeCharacter = async (
  repository: CampaignRepository,
  campaignId: string,
  characterId: string
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
    const updatedCampaign = await repository.removeCharacter(campaignId, characterId);
    if (!updatedCampaign) {
      throw new Error("Error al remover personaje de la campaña");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
