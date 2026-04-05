import { Character } from "./character";

export interface CharacterRepository {
  getCharacterById(id: string): Promise<Character | null>;
  getAllCharacters(): Promise<Character[]>;
  createCharacter(character: Omit<Character, "id">): Promise<Character | null>;
  updateCharacter(character: Character): Promise<Character | null>;
  deleteCharacter(id: string): Promise<boolean>;
}
