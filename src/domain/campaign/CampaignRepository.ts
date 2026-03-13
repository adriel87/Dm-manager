import { CampaignI } from "./campaign";

export interface CampaignRepository {
  getAllCampaigns(): Promise<CampaignI[]>;
  getCampaignById(id: string): Promise<CampaignI | null>;
  createCampaign(campaign: Omit<CampaignI, "id">): Promise<CampaignI>;
  updateCampaign(campaign: CampaignI): Promise<CampaignI | null>;
  deleteCampaign(id: string): Promise<boolean>;
}
