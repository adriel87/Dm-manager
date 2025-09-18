import { Campaign } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { getCampaignById } from "./getCampaignById";
import { updateCampaign } from "./updateCampaign";

export const campaignIncrementSessions = async (campaignRepository: CampaignRepository, campaignToIncrementSession: Campaign) => {
    const campaign = await getCampaignById(campaignRepository, campaignToIncrementSession.id)
    if (campaign) {
        updateCampaign(campaignRepository, {
            ...campaign,
            sessions: campaign.sessions ? campaign.sessions ++ : 1
        })
    }
}