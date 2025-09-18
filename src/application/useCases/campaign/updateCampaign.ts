import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";


export const updateCampaign = async (repository: CampaignRepository, campaign: CampaignI): Promise<CampaignI | null> => {
    // Ensure the campaignData contains the necessary fields for update
    if (!campaign.id) {
        throw new Error("Invalid campaign data or ID");
    }
    const existingCampaign = await repository.getCampaignById(campaign.id);
    if (!existingCampaign) {
        throw new Error("Campaign not found");
    }

    const updatedCampaign = await repository.updateCampaign({ ...existingCampaign, ...campaign });
    if (!updatedCampaign) {
        throw new Error("Failed to update campaign");
    }
    return updatedCampaign;

}
