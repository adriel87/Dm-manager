import { getDashboardStats, getRecentCampaigns, getRecentGroups } from "@/application/useCases/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Dashboard use cases", () => {
    const mockDashboardRepository: DashboardRepository = {
        getStats: vi.fn(),
        getRecentCampaigns: vi.fn(),
        getRecentGroups: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDashboardStats", () => {
        it("should return dashboard stats", async () => {
            const mockStats = {
                totalCampaigns: 5,
                activeCampaigns: 3,
                totalGroups: 2,
                totalPlayers: 8,
                nextSessionAt: new Date()
            };
            vi.mocked(mockDashboardRepository.getStats).mockResolvedValue(mockStats);
            
            const result = await getDashboardStats(mockDashboardRepository);
            
            expect(result.totalCampaigns).toBe(5);
            expect(result.activeCampaigns).toBe(3);
            expect(result.totalGroups).toBe(2);
            expect(result.totalPlayers).toBe(8);
            expect(mockDashboardRepository.getStats).toHaveBeenCalledOnce();
        });

        it("should throw error when repository fails", async () => {
            vi.mocked(mockDashboardRepository.getStats).mockRejectedValue(new Error("DB error"));
            
            await expect(getDashboardStats(mockDashboardRepository)).rejects.toThrow("Failed to fetch dashboard stats");
        });
    });

    describe("getRecentCampaigns", () => {
        it("should return recent campaigns with default limit", async () => {
            const mockCampaigns = [
                {
                    id: "1",
                    name: "Campaign 1",
                    status: 'Activa' as const,
                    sessions: 3,
                    groupName: "Group 1",
                    nextSessionAt: null,
                    lastSessionAt: new Date()
                }
            ];
            vi.mocked(mockDashboardRepository.getRecentCampaigns).mockResolvedValue(mockCampaigns);
            
            const result = await getRecentCampaigns(mockDashboardRepository);
            
            expect(result).toEqual(mockCampaigns);
            expect(result[0].groupName).toBe("Group 1");
            expect(mockDashboardRepository.getRecentCampaigns).toHaveBeenCalledWith(5);
        });

        it("should return recent campaigns with custom limit", async () => {
            vi.mocked(mockDashboardRepository.getRecentCampaigns).mockResolvedValue([]);
            
            await getRecentCampaigns(mockDashboardRepository, 10);
            
            expect(mockDashboardRepository.getRecentCampaigns).toHaveBeenCalledWith(10);
        });

        it("should throw error when repository fails", async () => {
            vi.mocked(mockDashboardRepository.getRecentCampaigns).mockRejectedValue(new Error("DB error"));
            
            await expect(getRecentCampaigns(mockDashboardRepository)).rejects.toThrow("Failed to fetch recent campaigns");
        });
    });

    describe("getRecentGroups", () => {
        it("should return recent groups with default limit", async () => {
            const mockGroups = [
                {
                    id: "1",
                    name: "Group 1",
                    createdAt: new Date(),
                    members: [
                        {
                            playerName: "Player 1",
                            characterName: "Character 1",
                            classType: "Wizard",
                            level: 5
                        }
                    ]
                }
            ];
            vi.mocked(mockDashboardRepository.getRecentGroups).mockResolvedValue(mockGroups);
            
            const result = await getRecentGroups(mockDashboardRepository);
            
            expect(result).toEqual(mockGroups);
            expect(mockDashboardRepository.getRecentGroups).toHaveBeenCalledWith(5);
        });

        it("should return recent groups with custom limit", async () => {
            vi.mocked(mockDashboardRepository.getRecentGroups).mockResolvedValue([]);
            
            await getRecentGroups(mockDashboardRepository, 10);
            
            expect(mockDashboardRepository.getRecentGroups).toHaveBeenCalledWith(10);
        });

        it("should throw error when repository fails", async () => {
            vi.mocked(mockDashboardRepository.getRecentGroups).mockRejectedValue(new Error("DB error"));
            
            await expect(getRecentGroups(mockDashboardRepository)).rejects.toThrow("Failed to fetch recent groups");
        });
    });
});
