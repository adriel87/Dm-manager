import { Group } from "@/domain/group/group";
import { WithId, Document } from "mongodb";

export const mapGroupDocumentToGroup = (doc: Document | WithId<Document>): Group =>({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    members: doc.members || [],
    createdAt: new Date(doc.createdAt),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined
})