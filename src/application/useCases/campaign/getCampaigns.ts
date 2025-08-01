import { Campaign } from "@/domain/campaign.ts/campaign";
import { CampaignRepository } from "@/domain/campaign.ts/CampaignRepository";

export const getAllCampaigns = async (repository: CampaignRepository): Promise<Campaign[]> => {
    try {
        const campaigns = await repository.getAllCampaigns();
        return campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw new Error("Failed to fetch campaigns");
    }
}