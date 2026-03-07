import { Session } from "@/domain/session/session";
import { Document, WithId } from "mongodb";

export const sessionMapper = {
  fromMongoDocumentToEntity: (doc: WithId<Document>): Session => ({
    id: doc._id.toString(),
    campaignId: doc.campaignId,
    title: doc.title,
    notes: doc.notes,
    sessionNumber: doc.sessionNumber,
    date: doc.date,
  }),
};
