import { Character } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";



export const getCharacterById = async (repository: CharacterRepository, id: string): Promise<Character | null> => {
    if (id === null || id === undefined || id.trim() === "" || typeof id !== "string") {
        throw new Error("Invalid character ID");
    }
    const character = await repository.getCharacterById(id);
    if (!character) {
        throw new Error("Character not found");
    }
    return character;
};
 