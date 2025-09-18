import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const getCampaignById = async (repository: CampaignRepository, id: string): Promise<CampaignI | null> => {
        if (id === null || id === undefined || typeof id !== "string" || id.length < 1) {
            throw new Error("Invalid id")
        }
        const campaign = await repository.getCampaignById(id);
        return campaign;
    }