import {
  assertNotFinalizada,
  assertUniqueMissionName,
  EmbeddedMission,
  validateEmbeddedMission,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * updateMission — Updates an existing mission within a campaign.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Validate mission data
 * 4. Assert unique mission name (excluding current mission)
 * 5. Call repository.updateMission
 */
export const updateMission = async (
  repository: CampaignRepository,
  campaignId: string,
  mission: EmbeddedMission
): Promise<EmbeddedMission> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 3: Validate mission data
    validateEmbeddedMission(mission);

    // Step 4: Assert unique mission name (excluding current mission)
    assertUniqueMissionName(campaign.missions, mission.name, mission.id);

    // Step 5: Update in repository
    const updatedCampaign = await repository.updateMission(campaignId, mission);
    if (!updatedCampaign) {
      throw new Error("Error al actualizar misión");
    }

    return mission;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
