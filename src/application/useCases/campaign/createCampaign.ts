import { CampaignI, validateCampaign } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const createCampaign = async (repository: CampaignRepository, campaignData: Omit<CampaignI, "id">): Promise<CampaignI> => {
    try {
        validateCampaign(campaignData)
        const campaign = {
            ...campaignData,
            missions: [],
            sessions: [],
            notes: [],
            characters: [],
            group: null,
            discordSpeakerMappings: [],
            createdAt: new Date()
        }
        const newCampaign = await repository.createCampaign(campaign);
        return newCampaign;
    } catch (e) {
        console.error(e)
        throw new Error("Failed to create campaign");
    }
}