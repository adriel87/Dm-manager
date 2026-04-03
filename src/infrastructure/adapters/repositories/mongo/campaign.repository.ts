import {
  CampaignI,
  CharacterRef,
  EmbeddedItem,
  EmbeddedMission,
  EmbeddedSession,
  GroupSnapshot,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { ObjectId } from "mongodb";
import { campaignMappers } from "../../mappers/campaign.mapper";
import { MapperUtils } from "../../mappers/utils";

export const campaignRepository: CampaignRepository = {
  // ========================================
  // Root Entity Operations
  // ========================================
  getAllCampaigns: async () => {
    const campaigns = await getCollection("campaigns");
    const campaignList = await campaigns.find().toArray();
    const campaignsList: CampaignI[] =
      MapperUtils.fromDocumentListToEntityList(
        campaignList,
        campaignMappers.fromMongoDocumentToEntity,
      );
    return campaignsList;
  },

  getCampaignById: async (id: string) => {
    const collection = await getCollection("campaigns");
    const campaign = await collection.findOne({ _id: new ObjectId(id) });
    return campaign
      ? MapperUtils.fromMongoDocumentToEntity(
          campaign,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  createCampaign: async (campaign) => {
    const collection = await getCollection("campaigns");
    
    // Initialize aggregate collections with defaults
    const campaignWithDefaults = {
      ...campaign,
      missions: [],
      sessions: [],
      characters: [],
      group: null,
      inventory: { items: [], capacity: 100, money: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(campaignWithDefaults);
    return {
      ...campaignWithDefaults,
      id: result.insertedId.toString(),
    };
  },

  updateCampaign: async (campaign: CampaignI) => {
    const collection = await getCollection("campaigns");
    const { id, missions, sessions, characters, group, inventory, ...rootFields } = campaign;
    
    // Only update root-level fields, exclude aggregate collections
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...rootFields,
          updatedAt: new Date(),
        }
      },
      { returnDocument: "after" }
    );
    
    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  deleteCampaign: async (id: string) => {
    const campaigns = await getCollection("campaigns");
    const result = await campaigns.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  // ========================================
  // Mission Sub-Document Operations
  // ========================================
  addMission: async (campaignId: string, mission: EmbeddedMission) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $push: { missions: mission } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  updateMission: async (campaignId: string, mission: EmbeddedMission) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId), "missions.id": mission.id },
      {
        $set: {
          "missions.$": mission,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  removeMission: async (campaignId: string, missionId: string) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $pull: { missions: { id: missionId } as any } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  // ========================================
  // Session Sub-Document Operations
  // ========================================
  addSession: async (campaignId: string, session: EmbeddedSession) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $push: { sessions: session } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  updateSession: async (campaignId: string, session: EmbeddedSession) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId), "sessions.id": session.id },
      {
        $set: {
          "sessions.$": session,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  removeSession: async (campaignId: string, sessionId: string) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $pull: { sessions: { id: sessionId } as any } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  // ========================================
  // Character Sub-Document Operations
  // ========================================
  addCharacter: async (campaignId: string, character: CharacterRef) => {
    const collection = await getCollection("campaigns");
    // Use $addToSet for atomic deduplication - only adds if character.id doesn't exist
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(campaignId),
        "characters.id": { $ne: character.id }  // Filter: only if character not already in array
      },
      {
        $push: { characters: character } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  removeCharacter: async (campaignId: string, characterId: string) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $pull: { characters: { id: characterId } as any } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  // ========================================
  // Group Sub-Document Operations
  // ========================================
  assignGroup: async (campaignId: string, group: GroupSnapshot) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          group: group,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  removeGroup: async (campaignId: string) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          group: null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          campaignMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  // ========================================
  // Inventory Sub-Document Operations
  // ========================================
  addInventoryItem: async (campaignId: string, item: EmbeddedItem) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $push: { "inventory.items": item } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(result, campaignMappers.fromMongoDocumentToEntity)
      : null;
  },

  updateInventoryItem: async (campaignId: string, item: EmbeddedItem) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId), "inventory.items.id": item.id },
      {
        $set: {
          "inventory.items.$": item,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(result, campaignMappers.fromMongoDocumentToEntity)
      : null;
  },

  removeInventoryItem: async (campaignId: string, itemId: string) => {
    const collection = await getCollection("campaigns");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(campaignId) },
      {
        $pull: { "inventory.items": { id: itemId } as any } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result
      ? MapperUtils.fromMongoDocumentToEntity(result, campaignMappers.fromMongoDocumentToEntity)
      : null;
  },
};

