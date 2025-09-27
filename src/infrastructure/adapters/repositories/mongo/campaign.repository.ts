import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { ObjectId } from "mongodb";
import { campaingMappers } from "../../mappers/campaign.mapper";
import { MapperUtils } from "../../mappers/utils";

export const campaignRepository : CampaignRepository = {
    getAllCampaigns: async () => {
        const campaigns = await getCollection('campaigns');
        const campaignList = await campaigns.find().toArray()
        const campaignsList: CampaignI[] = MapperUtils.fromDocumentListToEntityList(campaignList, campaingMappers.fromMongoDocumentToEntity)
        return campaignsList;
    },
    getCampaignById: async (id: string) => {
        const collection = await getCollection('campaigns');
        const campaign = await collection.findOne({ _id: new ObjectId(id) });
        return campaign ? MapperUtils.fromMongoDocumentToEntity(campaign, campaingMappers.fromMongoDocumentToEntity) : null
    },
    createCampaign: async (campaign) => {
        const collection = await getCollection('campaigns');
        const result = await collection.insertOne(campaign);
        return {
            ...campaign,
            id: result.insertedId.toString()
        }
    },
    updateCampaign: async ( campaign: CampaignI) => {
        const campaigns = await getCollection('campaigns');
        const result = await campaigns.updateOne({ _id: new ObjectId(campaign.id) }, { $set: campaign });
        return result.modifiedCount > 0 ? campaign : null
    },
    deleteCampaign: async (id: string) => {
        const campaigns = await getCollection('campaigns');
        const result = await campaigns.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
};

