import { CharacterRepository } from "@/domain/character/characterRepository";


export const deleteCharacter = async (characterRepository: CharacterRepository, id: string): Promise<boolean> => {
    if (id === null || id === undefined || id.trim() === "") {
        throw new Error("Invalid character ID");
    }

    const existingCharacter = await characterRepository.getCharacterById(id);
    if (!existingCharacter) {
        throw new Error("Character not found");
    }

    const result = await characterRepository.deleteCharacter(id);
    if (!result) {
        throw new Error("Character deletion failed");
    }

    return true;
}