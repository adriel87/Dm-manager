import { Document, WithId } from 'mongodb';

type MongoDocs = Document | WithId<Document> ;

export const MapperUtils = {
    fromDocumentListToEntityList: <T>(docs: MongoDocs[], mapper: (doc: MongoDocs) => T): T[] => {
        if (!docs || docs.length === 0) {
            return [];
        }
        return docs.map(mapper);
    },
}