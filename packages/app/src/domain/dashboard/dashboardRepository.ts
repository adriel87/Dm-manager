import { DashboardStatsData, DashboardCampaign, DashboardGroup } from "./dashboard";

export interface DashboardRepository {
  getStats(): Promise<DashboardStatsData>;
  getRecentCampaigns(limit?: number): Promise<DashboardCampaign[]>;
  getRecentGroups(limit?: number): Promise<DashboardGroup[]>;
}
