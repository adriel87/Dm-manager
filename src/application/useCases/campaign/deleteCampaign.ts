import { CampaignRepository } from "@/domain/repositories/CampaignRepository";

export const delelteCampaign = async (repository: CampaignRepository, id: string): Promise<boolean> => {
    try {
        const result = await repository.deleteCampaign(id);
        return result;
    } catch (error) {
        console.error("Error deleting campaign:", error);
        throw new Error("Failed to delete campaign");
    }
}