import { CharacterEntity } from "@/domain/character/character";
import { Document, WithId } from "mongodb";

export const characterMapper = {
    fromMongoDocumentToEntity: (doc: Document | WithId<Document>): CharacterEntity => {
        if (!doc) {
            throw new Error("Document is null or undefined");
        }
        return new CharacterEntity(
            doc._id,
            doc.name,
            doc.age,
            doc.classType,
            doc.level,
            doc.hitPoints,
            new Date(doc.createdAt),
            doc.updatedAt,
            doc.description,
            doc.location,
            doc.isNPC,
            doc.playerName
        );
    }
}