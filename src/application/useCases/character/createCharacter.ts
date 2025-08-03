import { Character } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";
import { CharacterSchema } from "@/infrastructure/adapters/schemas/character.schema";

export const createCharacter = async (characterRepository: CharacterRepository, character: Omit<Character, "id" | "createdAt" | "updatedAt">) => {
    // Validate the character object
    if (!character || !character.name || !character.classType || character.level < 1 || character.hitPoints < 0 || !character.age) {
        throw new Error("Invalid character data");
    }
    const characterData : Omit<Character, "id"> = {
        ...character,
        createdAt: new Date(),
        updatedAt: undefined
    };
    // Create the character in the repository
    const createdCharacter = await characterRepository.createCharacter(characterData);

    // Return the created character
    return createdCharacter;
}