import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

let store: CampaignI[] = [];
let nextId = 1;

export const campaignMemoryRepository: CampaignRepository = {
  getAllCampaigns: async () => [...store],

  getCampaignById: async (id) => store.find((c) => c.id === id) ?? null,

  createCampaign: async (campaign) => {
    const created = { ...campaign, id: String(nextId++) };
    store.push(created);
    return created;
  },

  updateCampaign: async (campaign) => {
    const index = store.findIndex((c) => c.id === campaign.id);
    if (index === -1) return null;
    store[index] = campaign;
    return campaign;
  },

  deleteCampaign: async (id) => {
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },
};

export const resetCampaignStore = () => {
  store = [];
  nextId = 1;
};
