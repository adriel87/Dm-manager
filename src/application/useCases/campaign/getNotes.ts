import { EmbeddedNote } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * getNotes — Retrieves all notes for a campaign, sorted by createdAt desc.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Return campaign.notes sorted newest first
 */
export const getNotes = async (
  repository: CampaignRepository,
  campaignId: string
): Promise<EmbeddedNote[]> => {
  try {
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Sort newest first
    return [...campaign.notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
