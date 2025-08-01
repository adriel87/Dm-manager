import { Character } from "./character";

export interface CharacterRepository {
    getCharacterById(id: string): Promise<Character | null>;
    getAllCharacters(): Promise<Character[]>;
    createCharacter(character: Character): Promise<Character>;
    updateCharacter(id: string, character: Partial<Character>): Promise<Character | null>;
    deleteCharacter(id: string): Promise<void>;
}