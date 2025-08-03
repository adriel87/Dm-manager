import { Campaign } from "@/domain/campaign.ts/campaign";
import { CampaignRepository } from "@/domain/campaign.ts/CampaignRepository";


export const updateCampaign = async (repository: CampaignRepository, campaignData: Campaign): Promise<Campaign | null> => {
    try {
        // Ensure the campaignData contains the necessary fields for update
        if (!campaignData.id) {
            throw new Error("Invalid campaign data or ID");
        }
        // const campaign = campaignSchema.parse(campaignData);
        const updatedCampaign = await repository.updateCampaign(campaignData);
        return updatedCampaign;
    } catch (error) {
        console.error("Error updating campaign:", error);
        throw new Error("Failed to update campaign");
    }
}