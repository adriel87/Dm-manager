import { AgeType, CharacterEntity, DnDClassEnum, isValidCharacter } from "@/domain/character/character";
import { describe, it, expect } from "vitest";

describe("CharacterEntity", () => {
    // Add tests for CharacterEntity methods and properties
    const validCharacter = {
        id: "1",
        name: "Hero",
        age: "adult" as AgeType,
        classType: DnDClassEnum.Fighter,
        level: 5,
        hitPoints: 30,
        createdAt: new Date(),
        updatedAt: undefined,
        description: "A brave warrior",
        location: "Castle",
        isNPC: false
    }

    describe("Constructor", () => {
        it("should create a valid character", () => {
            const character = new CharacterEntity(
                validCharacter.id,
                validCharacter.name,
                validCharacter.age,
                validCharacter.classType,
                validCharacter.level,
                validCharacter.hitPoints,
                validCharacter.createdAt,
                validCharacter.updatedAt,
                validCharacter.description,
                validCharacter.location,
                validCharacter.isNPC
            );
            expect(character).toBeInstanceOf(CharacterEntity);
            expect(character.id).toBe(validCharacter.id);
            expect(isValidCharacter(character)).toBeTruthy();
        });

        it("should throw an error for invalid character data", () => {
            expect(() => new CharacterEntity("", "", "adult", DnDClassEnum.Artificer, 0, -1, new Date())).toThrow("Invalid character data");
        });
    });
});
