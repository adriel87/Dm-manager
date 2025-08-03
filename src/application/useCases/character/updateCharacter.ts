import { Character, isValidCharacter } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";


export const updateCharacter = async (characterRepository: CharacterRepository, id: string, partialCharacter: Partial<Character>): Promise<Character | null> => {
    if (!id || !partialCharacter) {
        throw new Error("Invalid character ID or data");
    }

    const existingCharacter = await characterRepository.getCharacterById(id);
    if (!existingCharacter) {
        throw new Error("Character not found");
    }
    const updatedCharacter : Character = {
        ...existingCharacter,
        ...partialCharacter,
        updatedAt: new Date()
    };
    const isValid = isValidCharacter(updatedCharacter);
    if (!isValid) {
        throw new Error("Invalid character data");
    }
    const result = await characterRepository.updateCharacter(updatedCharacter)
    if (!result) {
        throw new Error("Character update failed");
    }

    return updatedCharacter;
}