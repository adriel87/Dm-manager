import { Character, isValidCharacter } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { WithId } from "mongodb";
import { characterMapper } from "../../mappers/character.mapper";
import { MapperUtils } from "../../mappers/utils";



export const characterRepository : CharacterRepository = {
    async getCharacterById(id: string): Promise<Character | null> {
        // Implementation to fetch character by ID from the database
        if (!id) {
            throw new Error("Character ID is required");
        }
        // Fetch character logic here
        const collection = await getCollection("characters");
        const character = await collection.findOne({ id });

        return character ? characterMapper.fromMongoDocumentToEntity(character) : null;
    },

    async getAllCharacters(): Promise<Character[]> {
        // Implementation to fetch all characters from the database
        const collection = await getCollection("characters");
        const characters = await collection.find().toArray();
        const list = MapperUtils.fromDocumentListToEntityList(characters as WithId<Document>[], characterMapper.fromMongoDocumentToEntity);
        return list;
    },


    async updateCharacter(character: Character): Promise<Character | null> {
        const collection = await getCollection("characters");
        const updateResult = await collection.updateOne({ id: character.id }, { $set: character });
        return updateResult.modifiedCount > 0 ? { ...character } : null;
    }, 

    async deleteCharacter(id: string): Promise<boolean> {
        // Implementation to delete a character from the database
        if (!id) {
            throw new Error("Character ID is required");
        }
        const collection = await getCollection("characters");
        const deleteResult = await collection.deleteOne({ id });   
        return deleteResult.deletedCount > 0;
    },
    async createCharacter(character: Omit<Character, "id">): Promise<Character | null> {
        const collection = await getCollection("characters");
        if (!isValidCharacter(character)) {
            throw new Error("Invalid character data");
        }

        const saveCharacter =  await collection.insertOne(character);
        if (!saveCharacter.insertedId) {
            throw new Error("Failed to create character");
        }
        const savedCharacter = await collection.findOne({ _id: saveCharacter.insertedId });
        return savedCharacter ? characterMapper.fromMongoDocumentToEntity(savedCharacter) : null;
    }
};