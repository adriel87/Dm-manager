import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const createCampaign = async (repository: CampaignRepository, campaignData: Omit<CampaignI, "id">): Promise<CampaignI> => {
    try {
        const campaign = {
            ...campaignData,
            createdAt: new Date()
        }
        const newCampaign = await repository.createCampaign(campaign);
        return newCampaign;
    } catch (error) {
        console.error("Error creating campaign:", error);
        throw new Error("Failed to create campaign");
    }
}