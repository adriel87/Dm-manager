import { Document as domongo, WithId } from 'mongodb';

type MongoDocs = domongo | WithId<domongo> ;

export const MapperUtils = {
    fromDocumentListToEntityList: <T>(docs: MongoDocs[], mapper: (doc: MongoDocs) => T): T[] => {
        if (!docs || docs.length === 0) {
            return [];
        }
        return docs.map(doc => MapperUtils.fromMongoDocumentToEntity<T>(doc, mapper));
    },
    fromMongoDocumentToEntity :<T>(docs: domongo, mapper: (doc: domongo) => T): T => {
    return mapper(docs)
}
}


