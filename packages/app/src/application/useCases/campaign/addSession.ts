import { randomUUID } from "crypto";
import {
  assertNotFinalizada,
  EmbeddedSession,
  validateEmbeddedSession,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * addSession — Adds a new session to a campaign with auto-incremented sessionNumber.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Validate session data
 * 4. Auto-compute sessionNumber = max(existing sessionNumbers) + 1
 * 5. Generate UUID for session
 * 6. Call repository.addSession
 * 7. Update lastSessionAt if session date is most recent
 */
export const addSession = async (
  repository: CampaignRepository,
  campaignId: string,
  sessionData: Omit<EmbeddedSession, "id" | "sessionNumber">
): Promise<EmbeddedSession> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 4: Compute sessionNumber (auto-increment)
    const maxSessionNumber = campaign.sessions.length > 0
      ? Math.max(...campaign.sessions.map(s => s.sessionNumber))
      : 0;
    const sessionNumber = maxSessionNumber + 1;

    // Step 5: Generate UUID and build complete session
    const session: EmbeddedSession = {
      ...sessionData,
      id: randomUUID(),
      sessionNumber,
    };

    // Step 3: Validate session data (after sessionNumber is set)
    validateEmbeddedSession(session);

    // Step 6: Add to repository
    const updatedCampaign = await repository.addSession(campaignId, session);
    if (!updatedCampaign) {
      throw new Error("Error al añadir sesión a la campaña");
    }

    // Step 7: Update lastSessionAt if this session is most recent
    const mostRecentSessionDate = Math.max(
      ...updatedCampaign.sessions.map(s => new Date(s.date).getTime())
    );
    if (new Date(session.date).getTime() === mostRecentSessionDate) {
      updatedCampaign.lastSessionAt = session.date;
      await repository.updateCampaign(updatedCampaign);
    }

    return session;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
