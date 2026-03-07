import { Session } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { ObjectId } from "mongodb";
import { sessionMapper } from "../../mappers/session.mapper";
import { MapperUtils } from "../../mappers/utils";

export const sessionRepository: SessionRepository = {
  getAllSessions: async () => {
    const collection = await getCollection("sessions");
    const docs = await collection.find().toArray();
    return MapperUtils.fromDocumentListToEntityList(docs, sessionMapper.fromMongoDocumentToEntity);
  },

  getSessionsByCampaign: async (campaignId: string) => {
    const collection = await getCollection("sessions");
    const docs = await collection.find({ campaignId }).toArray();
    return MapperUtils.fromDocumentListToEntityList(docs, sessionMapper.fromMongoDocumentToEntity);
  },

  getSessionById: async (id: string) => {
    const collection = await getCollection("sessions");
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? MapperUtils.fromMongoDocumentToEntity(doc, sessionMapper.fromMongoDocumentToEntity) : null;
  },

  createSession: async (session: Omit<Session, "id">) => {
    const collection = await getCollection("sessions");
    const result = await collection.insertOne(session);
    return { ...session, id: result.insertedId.toString() };
  },

  updateSession: async (session: Session) => {
    const collection = await getCollection("sessions");
    const { id, ...rest } = session;
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: rest });
    return result.modifiedCount > 0 ? session : null;
  },

  deleteSession: async (id: string) => {
    const collection = await getCollection("sessions");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};
