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


    beforeEach(() => {
        vi.clearAllMocks();
    });

  

    describe("updatecampaign", () => {
 
        it("should update a campaign successfully", async () => {
            const validCampaign: CampaignI = {
                id: "1",
                name: "campaign name",
                description: 'campaign description',
                sessions: 1,
                status: 'Activa',
            }
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
    })
    describe("deleteCharacter", () => {
        it("should delete a character successfully", async () => {
            // arrange
             const validCampaign: CampaignI = {
                id: "1",
                name: "campaign name",
                description: 'campaign description',
                sessions: 1,
                status: 'Activa',
            }
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
            const validCampaign : CampaignI= {
                id: '1',
                name: "campaign name",
                description: 'campaign description',
                sessions: 1,
                status: 'Finalizada',
            }
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