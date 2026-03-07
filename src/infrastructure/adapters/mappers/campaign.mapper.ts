import { CampaignI } from "@/domain/campaign/campaign";
import { Document, WithId } from "mongodb";

export const campaingMappers = {
    fromMongoDocumentToEntity: (doc: Document | WithId<Document> ): CampaignI => {
        if (!doc) {
            throw new Error("Document is null or undefined");
        }

        return {
            id: doc._id,
            description: doc.description,
            name: doc.name,
            sessions:doc.sessions,
            status: doc.status,
            createdAt:new Date(doc.createdAt),
            lastSessionAt: doc.lastSessionAt ? new Date(doc.lastSessionAt) : undefined,
            nextSessionAt: doc.nextSessionAt ? new Date(doc.nextSessionAt): undefined,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt): undefined
        }
    }
}