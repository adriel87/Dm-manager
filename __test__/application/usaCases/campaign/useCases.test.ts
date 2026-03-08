import { createCampaign, delelteCampaign, getAllCampaigns, getCampaignById, updateCampaign } from "@/application/useCases/campaign";
import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { beforeEach,  describe,  expect, it, vi } from "vitest";


describe("Character use cases", () => {
    const mockCampaignRepository: CampaignRepository = {
        getAllCampaigns: vi.fn(),
        getCampaignById: vi.fn(),
        createCampaign: vi.fn(),
        updateCampaign: vi.fn(),
        deleteCampaign: vi.fn(),
    }

    const validCampaign: CampaignI = {
        id: "1",
        name: "campaign name",
        description: 'campaign description',
        sessions: 1,
        status: 'Activa',
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });


    describe("createCampaign", () => {
        it("should create a campaign successfully", async () => {
            // arrange
            const { id, ...campaignData } = validCampaign;
            vi.mocked(mockCampaignRepository.createCampaign).mockResolvedValue(validCampaign);
            // act
            const result = await createCampaign(mockCampaignRepository, campaignData);
            // assert
            expect(result.id).toBe(validCampaign.id);
            expect(result.name).toBe(validCampaign.name);
            expect(mockCampaignRepository.createCampaign).toHaveBeenCalledOnce();
        })

        it("should throw 'Failed to create campaign' when name is invalid", async () => {
            // arrange
            const { id, ...campaignData } = validCampaign;
            const invalidData = { ...campaignData, name: "ab" }; // less than 3 chars
            // act
            const result = createCampaign(mockCampaignRepository, invalidData);
            // assert
            await expect(result).rejects.toThrow("Failed to create campaign");
            expect(mockCampaignRepository.createCampaign).not.toHaveBeenCalled();
        })

        it("should throw 'Failed to create campaign' when description is missing", async () => {
            // arrange
            const { id, ...campaignData } = validCampaign;
            const invalidData = { ...campaignData, description: "" };
            // act
            const result = createCampaign(mockCampaignRepository, invalidData);
            // assert
            await expect(result).rejects.toThrow("Failed to create campaign");
            expect(mockCampaignRepository.createCampaign).not.toHaveBeenCalled();
        })

        it("should throw 'Failed to create campaign' when repository throws", async () => {
            // arrange
            const { id, ...campaignData } = validCampaign;
            vi.mocked(mockCampaignRepository.createCampaign).mockRejectedValue(new Error("DB error"));
            // act
            const result = createCampaign(mockCampaignRepository, campaignData);
            // assert
            await expect(result).rejects.toThrow("Failed to create campaign");
        })
    })

    describe("getAllCampaigns", () => {
        it("should return all campaigns", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockResolvedValue([validCampaign]);
            // act
            const result = await getAllCampaigns(mockCampaignRepository);
            // assert
            expect(result).toEqual([validCampaign]);
            expect(mockCampaignRepository.getAllCampaigns).toHaveBeenCalledOnce();
        })

        it("should return an empty array when there are no campaigns", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockResolvedValue([]);
            // act
            const result = await getAllCampaigns(mockCampaignRepository);
            // assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        })

        it("should throw 'Failed to fetch campaigns' when repository throws", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockRejectedValue(new Error("DB connection error"));
            // act
            const result = getAllCampaigns(mockCampaignRepository);
            // assert
            await expect(result).rejects.toThrow("Failed to fetch campaigns");
        })
    })

    describe("updatecampaign", () => {

        it("should update a campaign successfully", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.updateCampaign).mockResolvedValue({ ...validCampaign, name: "hola" });
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            // act
            const result = await updateCampaign(mockCampaignRepository, { ...validCampaign, name: "hola" });
            // assert
            expect(mockCampaignRepository.updateCampaign).toHaveBeenCalledOnce();
            expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledOnce();
        })

        it("should throw an error for invalid campaign data", async () => {
            vi.clearAllMocks()
            // arrange
            // act
            const result = updateCampaign(mockCampaignRepository, {} as CampaignI);
            // assert
            await expect(result).rejects.toThrow("Invalid campaign data or ID");
        })

        it("should throw 'Campaign not found' when campaign does not exist", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            // act
            const result = updateCampaign(mockCampaignRepository, validCampaign);
            // assert
            await expect(result).rejects.toThrow("Campaign not found");
            expect(mockCampaignRepository.updateCampaign).not.toHaveBeenCalled();
        })

        it("should throw 'Failed to update campaign' when repository returns null", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.updateCampaign).mockResolvedValue(null);
            // act
            const result = updateCampaign(mockCampaignRepository, validCampaign);
            // assert
            await expect(result).rejects.toThrow("Failed to update campaign");
        })
    })

    describe("deleteCharacter", () => {
        it("should delete a character successfully", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.deleteCampaign).mockResolvedValue(true);
            // act
            const result = await delelteCampaign(mockCampaignRepository, validCampaign.id);
            // assert
            expect(result).toBe(true);
            expect(mockCampaignRepository.deleteCampaign).toHaveBeenCalledWith( validCampaign.id);
        })

        it("should throw an error if character does not exist", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.deleteCampaign).mockResolvedValue(false);
            // act
            const result = delelteCampaign(mockCampaignRepository, null as any);
            // assert
            await expect(result).rejects.toThrow("Failed to delete campaign");
        })
    })

    describe("getCharacterById", () => {
        it("should return a character by ID", async () => {
            // arrange
            const id = '1';
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign)
            // act
            const result = await getCampaignById(mockCampaignRepository, id);
            // assert
            expect(result?.id).toBe(validCampaign.id);
            expect(result?.name).toBe(validCampaign.name);
            expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledWith(validCampaign.id);
        })

        it("should throw an error if character does not exist, the error would be 'Character not found'", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            const id = "non-existent-id";
            // act
            const result = getCampaignById(mockCampaignRepository, id);
            // assert
            await expect(result).resolves.toBe(null);
        })
        it("should return null when campaign not exist", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            const id = "non-existent-id";
            // act
            const result = getCampaignById(mockCampaignRepository, id);
            // assert
            await expect(result).resolves.toBe(null);
        })
        it("should throw an error when the id is invalid, Invalid id", async () => {
            // arrange
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            const id = null;
            // act
            const result = getCampaignById(mockCampaignRepository, id as unknown as string);
            // assert
            await expect(result).rejects.toThrow("Invalid id")
        })
    })

});