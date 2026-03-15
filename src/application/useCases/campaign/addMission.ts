import { randomUUID } from "crypto";
import {
  assertNotFinalizada,
  assertUniqueMissionName,
  EmbeddedMission,
  validateEmbeddedMission,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * addMission — Adds a new mission to a campaign's missions array.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Validate mission data
 * 4. Assert unique mission name
 * 5. Generate UUID for mission
 * 6. Call repository.addMission
 */
export const addMission = async (
  repository: CampaignRepository,
  campaignId: string,
  missionData: Omit<EmbeddedMission, "id">
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
    validateEmbeddedMission(missionData);

    // Step 4: Assert unique mission name
    assertUniqueMissionName(campaign.missions, missionData.name);

    // Step 5: Generate UUID
    const mission: EmbeddedMission = {
      ...missionData,
      id: randomUUID(),
    };

    // Step 6: Add to repository
    const updatedCampaign = await repository.addMission(campaignId, mission);
    if (!updatedCampaign) {
      throw new Error("Error al añadir misión a la campaña");
    }

    return mission;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
