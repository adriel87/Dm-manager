import { Character } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";

let store: Character[] = [];
let nextId = 1;

export const characterMemoryRepository: CharacterRepository = {
  getAllCharacters: async () => [...store],

  getCharacterById: async (id) => store.find((c) => c.id === id) ?? null,

  createCharacter: async (character) => {
    const created: Character = { ...character, id: String(nextId++) };
    store.push(created);
    return created;
  },

  updateCharacter: async (character) => {
    const index = store.findIndex((c) => c.id === character.id);
    if (index === -1) return null;
    store[index] = character;
    return character;
  },

  deleteCharacter: async (id) => {
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },
};

export const resetCharacterStore = () => {
  store = [];
  nextId = 1;
};
