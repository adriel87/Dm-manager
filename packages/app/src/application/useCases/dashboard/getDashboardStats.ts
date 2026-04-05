import { DashboardStatsData } from "@/domain/dashboard/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";

export const getDashboardStats = async (
    repository: DashboardRepository
): Promise<DashboardStatsData> => {
    try {
        return await repository.getStats();
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
};
