import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { SpeakerMapping, validateSpeakerMapping } from "@/domain/recording/recording";

/**
 * setSpeakerMappings — Replaces the full discordSpeakerMappings array on a campaign.
 *
 * Steps:
 * 1. Validate each mapping with validateSpeakerMapping
 * 2. Call campaignRepository.setSpeakerMappings
 * 3. Return updated campaign
 */
export const setSpeakerMappings = async (
  campaignRepository: CampaignRepository,
  campaignId: string,
  mappings: SpeakerMapping[]
): Promise<CampaignI | null> => {
  try {
    // Step 1: Validate each mapping
    for (const mapping of mappings) {
      validateSpeakerMapping(mapping);
    }

    // Step 2 & 3: Persist and return
    return campaignRepository.setSpeakerMappings(campaignId, mappings);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
