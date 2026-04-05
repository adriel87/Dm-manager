import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { ObjectId } from "mongodb";
import { recordingMappers } from "../../mappers/recording.mapper";
import { MapperUtils } from "../../mappers/utils";

export const recordingRepository: RecordingRepository = {
  getRecordingById: async (id: string) => {
    const collection = await getCollection("recordings");
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc
      ? MapperUtils.fromMongoDocumentToEntity(
          doc,
          recordingMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  getRecordingsBySession: async (campaignId: string, sessionId: string) => {
    const collection = await getCollection("recordings");
    const docs = await collection.find({ campaignId, sessionId }).toArray();
    return MapperUtils.fromDocumentListToEntityList(
      docs,
      recordingMappers.fromMongoDocumentToEntity,
    );
  },

  getRecordingsByCampaign: async (campaignId: string) => {
    const collection = await getCollection("recordings");
    const docs = await collection.find({ campaignId }).toArray();
    return MapperUtils.fromDocumentListToEntityList(
      docs,
      recordingMappers.fromMongoDocumentToEntity,
    );
  },

  createRecording: async (recording: Omit<RecordingI, "id">) => {
    const collection = await getCollection("recordings");
    const result = await collection.insertOne({
      ...recording,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      ...recording,
      id: result.insertedId.toString(),
      createdAt: recording.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
  },

  updateRecording: async (recording: RecordingI) => {
    const collection = await getCollection("recordings");
    const { id, ...fields } = recording;
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...fields,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    return result
      ? MapperUtils.fromMongoDocumentToEntity(
          result,
          recordingMappers.fromMongoDocumentToEntity,
        )
      : null;
  },

  deleteRecording: async (id: string) => {
    const collection = await getCollection("recordings");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};
