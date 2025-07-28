import { Campaign } from "../entities/campaign";

export interface CampaignRepository {
    getAllCampaigns(): Promise<Campaign[]>;
    getCampaignById(id: string): Promise<Campaign | null>;
    createCampaign(campaign: Omit<Campaign, "id">): Promise<Campaign>;
    updateCampaign(campaign: Campaign): Promise<Campaign | null>;
    deleteCampaign(id: string): Promise<boolean>;
}