import { Campaign } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { Document, ObjectId, WithId } from "mongodb";

export const campaignRepository : CampaignRepository = {
    getAllCampaigns: async () => {
        const campaigns = await getCollection('campaigns');
        const campaignsList: Campaign[] = (await campaigns.find({}).toArray()).map(mapCampaignFromMongoToDomain);
        return campaignsList;
    },
    getCampaignById: async (id: string) => {
        const collection = await getCollection('campaigns');
        const campaign = await collection.findOne({ _id: new ObjectId(id) });
        return campaign ? mapCampaignFromMongoToDomain(campaign) : null;
    },
    createCampaign: async (campaign) => {
        const collection = await getCollection('campaigns');
        const result = await collection.insertOne(campaign);
        return {
            description: campaign.description,
            name: campaign.name,
            createdAt: campaign.createdAt,
            status: campaign.status,
            id: result.insertedId.toString() // Convert ObjectId to string
        }
    },
    updateCampaign: async ( campaign: Campaign) => {
        const campaigns = await getCollection('campaigns');
        const existingCampaign = await campaigns.findOne({ _id: new ObjectId(campaign.id) });
        if (!existingCampaign) {
            return null; // Campaign not found
        }
        const newCampaign : Campaign = {
            ...existingCampaign,
            ...campaign,
            updatedAt: new Date() // Update the updatedAt field
        }
        const result = await campaigns.updateOne({ _id: new ObjectId(campaign.id) }, { $set: newCampaign });
        return result.modifiedCount > 0 ? { id: campaign.id, description: campaign.description, name: campaign.name, createdAt: campaign.createdAt, updatedAt: campaign.updatedAt, status: campaign.status } : null;
    },
    deleteCampaign: async (id: string) => {
        const campaigns = await getCollection('campaigns');
        const result = await campaigns.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
};

export const mapCampaignFromMongoToDomain = (campaign: WithId<Document>): Campaign => {
    return {
        id: campaign._id.toString(),
        description: campaign.description,
        name: campaign.name,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        status: campaign.status
    };
};