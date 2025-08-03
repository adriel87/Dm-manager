import { CharacterRepository } from "@/domain/character/characterRepository";


export const getAllCharacters = async (characterRepository: CharacterRepository) => {
    try {
        const characters = await characterRepository.getAllCharacters();
        return characters;
    } catch (error) {
        console.error("Error fetching characters:", error);
        throw new Error("Failed to fetch characters");
    }
}