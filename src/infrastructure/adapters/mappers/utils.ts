import {Document} from 'mongodb'

export const MapperUtils = {
    fromMongoDocumentListToEntityList: <T>(docs: Document[], mapper: (doc: Document) => T): T[] => {
        if (!docs || docs.length === 0) {
            return [];
        }
        return docs.map(doc => MapperUtils.fromMongoDocumentToEntity<T>(doc, mapper));
    },
    fromMongoDocumentToEntity :<T>(docs: Document, mapper: (doc: Document) => T): T => {
    return docs.map(mapper);
}
}


