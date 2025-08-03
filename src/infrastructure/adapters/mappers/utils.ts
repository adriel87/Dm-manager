export const MapperUtils = {
    fromDocumentListToEntityList: <T>(docs: Document[], mapper: (doc: Document) => T): T[] => {
        if (!docs || docs.length === 0) {
            return [];
        }
        return docs.map(mapper);
    },
}