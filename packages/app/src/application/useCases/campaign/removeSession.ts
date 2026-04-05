import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * removeSession — Removes a session from a campaign's sessions array.
 * Does NOT renumber remaining sessions.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Call repository.removeSession
 */
export const removeSession = async (
  repository: CampaignRepository,
  campaignId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 3: Remove from repository (NO renumbering)
    const updatedCampaign = await repository.removeSession(campaignId, sessionId);
    if (!updatedCampaign) {
      throw new Error("Error al eliminar sesión");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
