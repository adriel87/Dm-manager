import { Campaign } from "@/domain/entities/campaign";
import { CampaignRepository } from "@/domain/repositories/CampaignRepository";

export const getCampaignById = async (repository: CampaignRepository, id: string): Promise<Campaign | null> => {
    try {
        const campaign = await repository.getCampaignById(id);
        return campaign;
    } catch (error) {
        console.error("Error fetching campaign by ID:", error);
        throw new Error("Failed to fetch campaign by ID");
    }
}