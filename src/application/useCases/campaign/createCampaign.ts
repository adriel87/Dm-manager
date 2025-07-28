import { Campaign } from "@/domain/entities/campaign";
import { CampaignRepository } from "@/domain/repositories/CampaignRepository";

export const createCampaign = async (repository: CampaignRepository, campaignData: Omit<Campaign, "id">): Promise<Campaign> => {
    try {
        const newCampaign = await repository.createCampaign(campaignData);
        return newCampaign;
    } catch (error) {
        console.error("Error creating campaign:", error);
        throw new Error("Failed to create campaign");
    }
}