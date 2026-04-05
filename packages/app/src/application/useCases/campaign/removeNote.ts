import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * removeNote — Removes a note from a campaign's notes array.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Call repository.removeNote
 */
export const removeNote = async (
  repository: CampaignRepository,
  campaignId: string,
  noteId: string
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
    const updatedCampaign = await repository.removeNote(campaignId, noteId);
    if (!updatedCampaign) {
      throw new Error("Error al eliminar nota");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
