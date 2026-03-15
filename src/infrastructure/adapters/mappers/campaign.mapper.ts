import { CampaignI } from "@/domain/campaign/campaign";
import { Document, WithId } from "mongodb";

export const campaignMappers = {
    fromMongoDocumentToEntity: (doc: Document | WithId<Document> ): CampaignI => {
        if (!doc) {
            throw new Error("Document is null or undefined");
        }

        return {
            id: doc._id.toString(),  // Fix: convert ObjectId to string
            description: doc.description,
            name: doc.name,
            status: doc.status,
            
            // Aggregate collections with defaults
            missions: doc.missions ?? [],
            sessions: doc.sessions ?? [],
            characters: doc.characters ?? [],
            group: doc.group ?? null,
            
            // Metadata
            createdAt: new Date(doc.createdAt),
            lastSessionAt: doc.lastSessionAt ? new Date(doc.lastSessionAt) : undefined,
            nextSessionAt: doc.nextSessionAt ? new Date(doc.nextSessionAt): undefined,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt): undefined
        }
    }
}