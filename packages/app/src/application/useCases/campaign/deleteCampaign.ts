import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const deleteCampaign = async (repository: CampaignRepository, id: string): Promise<boolean> => {
        const result = await repository.deleteCampaign(id);
        if (!result) {
            throw new Error("Failed to delete campaign");
        }
        return result;
    }       