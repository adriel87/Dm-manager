import { CharacterRepository } from "@/domain/character/characterRepository";
import { CharacterSchema } from "@/infrastructure/adapters/schemas/character.schema";

export const createCharacter = async (characterRepository: CharacterRepository, character: CharacterSchema) => {
    // Validate the character object
    if (!character || !character.name || !character.classType) {
        throw new Error("Invalid character data");
    }

    // Create the character in the repository
    const createdCharacter = await characterRepository.createCharacter(character);
    
    // Return the created character
    return createdCharacter;
}