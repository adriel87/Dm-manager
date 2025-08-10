import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";


export const updateCampaign = async (repository: CampaignRepository, campaignData: Partial<CampaignI>): Promise<CampaignI | null> => {
    try {
        // Ensure the campaignData contains the necessary fields for update
        if (!campaignData.id) {
            throw new Error("Invalid campaign data or ID");
        }
        const existingCampaign = await repository.getCampaignById(campaignData.id);
        if (!existingCampaign) {
            throw new Error("Campaign not found");
        }

        // const campaign = campaignSchema.parse(campaignData);
        const updatedCampaign = await repository.updateCampaign({ ...existingCampaign, ...campaignData });
        return updatedCampaign;
    } catch (error) {
        console.error("Error updating campaign:", error);
        throw new Error("Failed to update campaign");
    }
}