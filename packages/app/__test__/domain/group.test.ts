import { DnDClassEnum } from "@/domain/character/character";
import { validateGroup } from "@/domain/group/group";
import { describe, expect, it } from "vitest";


describe("Group domain Tests", () => {
    // arrange
    const validGroup = {
        name: "Test Group",
        description: "This is a test group",
        members: [
            { id: "1", name: "Member One", classType: DnDClassEnum.Cleric},
        ]
    };
 

    it("Validate group with valid data", () => {
        expect(() => validateGroup(validGroup)).not.toThrow();
    });
    it("Validate group with invalid data", () => {
        // arrange
        const invalidGroup = {
           ...validGroup,
            name: "", // Invalid name
        };
        // act & assert
        expect(() => validateGroup(invalidGroup)).toThrow("Group name is required");
    });
})