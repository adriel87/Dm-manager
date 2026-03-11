import { DashboardStats, DashboardCampaign, DashboardGroup } from "./dashboard";

export interface DashboardRepository {
    getStats(): Promise<DashboardStats>;
    getRecentCampaigns(limit?: number): Promise<DashboardCampaign[]>;
    getRecentGroups(limit?: number): Promise<DashboardGroup[]>;
}
