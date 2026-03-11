import { DashboardGroup } from "@/domain/dashboard/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";

export const getRecentGroups = async (
    repository: DashboardRepository,
    limit: number = 5
): Promise<DashboardGroup[]> => {
    try {
        return await repository.getRecentGroups(limit);
    } catch (error) {
        console.error("Error fetching recent groups:", error);
        throw new Error("Failed to fetch recent groups");
    }
};
