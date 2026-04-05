import {
  assertNotFinalizada,
  EmbeddedSession,
  validateEmbeddedSession,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * updateSession — Updates an existing session within a campaign.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Validate session data
 * 4. Verify sessionNumber is not being changed
 * 5. Call repository.updateSession
 */
export const updateSession = async (
  repository: CampaignRepository,
  campaignId: string,
  session: EmbeddedSession
): Promise<EmbeddedSession> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 3: Validate session data
    validateEmbeddedSession(session);

    // Step 4: Verify sessionNumber is not being changed
    const existingSession = campaign.sessions.find(s => s.id === session.id);
    if (existingSession && existingSession.sessionNumber !== session.sessionNumber) {
      throw new Error("No se puede cambiar el número de sesión");
    }

    // Step 5: Update in repository
    const updatedCampaign = await repository.updateSession(campaignId, session);
    if (!updatedCampaign) {
      throw new Error("Error al actualizar sesión");
    }

    return session;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
