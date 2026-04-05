import { createCharacter } from "@/application/useCases/character/createCharacter";
import { deleteCharacter } from "@/application/useCases/character/deleteCharacter";
import { getAllCharacters } from "@/application/useCases/character/getAllCharacters";
import { getCharacterById } from "@/application/useCases/character/getCharacter";
import { updateCharacter } from "@/application/useCases/character/updateCharacter";
import { AgeType, Character, DnDClassEnum } from "@/domain/character/character";
import { CharacterRepository } from "@/domain/character/characterRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";


describe("Character use cases", () => {
    const mockCharacterRepository : CharacterRepository= {
        getAllCharacters: vi.fn(),
        getCharacterById: vi.fn(),
        createCharacter: vi.fn(),
        updateCharacter: vi.fn(),
        deleteCharacter: vi.fn(),
    }
    const validCharacter : Character= {
        id: "1",
        name: "Test Character",
        age: "adult",
        classType: DnDClassEnum.Fighter,
        level: 1,
        hitPoints: 10,
        createdAt: new Date(),
        updatedAt: undefined,
        description: "A brave warrior",
        location: "Castle",
        isNPC: false
    }

    const validCharacterList : Character[] = [
        validCharacter,
    ]

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAllCharacters", () => {
        it("should return all characters", async () => {
            // arrange
            // Implement test logic here
            vi.mocked(mockCharacterRepository.getAllCharacters).mockResolvedValue(validCharacterList);
            // act
            const result = getAllCharacters(mockCharacterRepository);
           // assert
           await expect(result).resolves.toEqual(validCharacterList);
           expect(mockCharacterRepository.getAllCharacters).toHaveBeenCalledTimes(1);
        })

        it("should handle empty character list", async () => {
            // arrange
            vi.mocked(mockCharacterRepository.getAllCharacters).mockResolvedValue([]);
            // act
            const result = getAllCharacters(mockCharacterRepository);
            // assert
            await expect(result).resolves.toEqual([]);
            expect(mockCharacterRepository.getAllCharacters).toHaveBeenCalledTimes(1);

        })

    })

    describe("createCharacter", () => {
         const characterToCreate = {
                id: "1",
                name: "Test Character",
                age: "adult" as AgeType,
                classType: DnDClassEnum.Fighter,
                level: 1,
                hitPoints: 10,
                updatedAt: undefined,
                description: "A brave warrior",
                location: "Castle",
                isNPC: false
            };
        it("should create a character successfully", async () => {
            // arrange
           
             vi.mocked(mockCharacterRepository.createCharacter).mockResolvedValue(validCharacter);
            // act
            const result = await createCharacter(mockCharacterRepository, characterToCreate);
            // assert
            expect(result?.id).not.toBeNull();
            expect(result?.name).toBe(characterToCreate.name);
            expect(result?.age).toBe(characterToCreate.age);
            expect(result?.classType).toBe(characterToCreate.classType);
            expect(result?.level).toBe(characterToCreate.level);
            expect(result?.hitPoints).toBe(characterToCreate.hitPoints);
            expect(result?.createdAt).toBeInstanceOf(Date);
            expect(result?.updatedAt).toBeUndefined();
            expect(result?.description).toBe(characterToCreate.description);
            expect(result?.location).toBe(characterToCreate.location);
            expect(result?.isNPC).toBe(characterToCreate.isNPC);
            expect(mockCharacterRepository.createCharacter).toHaveBeenCalledOnce();
        })

        it("should throw an error for invalid character data", async () => {
            // arrange
            const invalidCharacter = { ...characterToCreate, name: "" };

            // act
            const result = createCharacter(mockCharacterRepository, invalidCharacter);
            // assert
            await expect(result).rejects.toThrow("Invalid character data");
            expect(mockCharacterRepository.createCharacter).not.toHaveBeenCalled();

        })
    })

    describe("updateCharacter", () => {
        it("should update a character successfully", async () => {
            // arrange
            const updatedCharacter = { ...validCharacter, name: "Updated Character" };
            vi.mocked(mockCharacterRepository.updateCharacter).mockResolvedValue(updatedCharacter);
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(validCharacter);
            // act
            const result = await updateCharacter(mockCharacterRepository, validCharacter.id, updatedCharacter);
            // assert
            expect(result?.name).toBe("Updated Character");
            expect(mockCharacterRepository.updateCharacter).toHaveBeenCalledOnce();
        })

        it("should throw an error for invalid character data", async () => {
            // arrange
            const invalidUpdate = { ...validCharacter, level: -1 };
            // act
            const result = updateCharacter(mockCharacterRepository, invalidUpdate.id, invalidUpdate);
            // assert
            await expect(result).rejects.toThrow("Invalid character data");
        })
    })
    describe("deleteCharacter", () => {
        it("should delete a character successfully", async () => {
            // arrange
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(validCharacter);
            vi.mocked(mockCharacterRepository.deleteCharacter).mockResolvedValue(true);
            // act
            const result = await deleteCharacter(mockCharacterRepository, validCharacter.id);
            // assert
            expect(result).toBe(true);
            expect(mockCharacterRepository.deleteCharacter).toHaveBeenCalledWith(validCharacter.id);
        })

        it("should throw an error if character does not exist", async () => {
            // arrange
            vi.mocked(mockCharacterRepository.deleteCharacter).mockResolvedValue(false);
            // act
            const result = deleteCharacter(mockCharacterRepository, null as any);
            // assert
            await expect(result).rejects.toThrow("Invalid character ID");
        })
    })

    describe("getCharacterById", () => {
        it("should return a character by ID", async () => {
            // arrange
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(validCharacter);
            const id = validCharacter.id;
            // act
            const result = await getCharacterById(mockCharacterRepository, id);
            // assert
            expect(result?.id).toBe(validCharacter.id);
            expect(result?.name).toBe(validCharacter.name);
            expect(mockCharacterRepository.getCharacterById).toHaveBeenCalledWith(validCharacter.id);
        })

        it("should throw an error if character does not exist, the error would be 'Character not found'", async () => {
            // arrange
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(null);
            const id = "non-existent-id";
            // act
            const result =  getCharacterById(mockCharacterRepository, id);
            // assert
            await expect(result).rejects.toThrow("Character not found");
        })
    })

});