import { DashboardCampaign } from "@/domain/dashboard/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";

export const getRecentCampaigns = async (
    repository: DashboardRepository,
    limit: number = 5
): Promise<DashboardCampaign[]> => {
    try {
        return await repository.getRecentCampaigns(limit);
    } catch (error) {
        console.error("Error fetching recent campaigns:", error);
        throw new Error("Failed to fetch recent campaigns");
    }
};
