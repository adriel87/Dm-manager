import { DashboardStats, DashboardCampaign, DashboardGroup } from "@/domain/dashboard/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";

// In-memory store for dashboard data
let stats: DashboardStats = {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalGroups: 0,
    totalPlayers: 0,
    nextSessionAt: null
};

let recentCampaigns: DashboardCampaign[] = [];
let recentGroups: DashboardGroup[] = [];

export const dashboardMemoryRepository: DashboardRepository = {
    getStats: async () => ({ ...stats }),

    getRecentCampaigns: async (limit: number = 5) => {
        return [...recentCampaigns].slice(0, limit);
    },

    getRecentGroups: async (limit: number = 5) => {
        return [...recentGroups].slice(0, limit);
    },
};

// Helper functions to set data (for testing/seeding)
export const setDashboardStats = (newStats: DashboardStats) => {
    stats = { ...newStats };
};

export const setRecentCampaigns = (campaigns: DashboardCampaign[]) => {
    recentCampaigns = [...campaigns];
};

export const setRecentGroups = (groups: DashboardGroup[]) => {
    recentGroups = [...groups];
};

// Reset store for testing
export const resetDashboardStore = () => {
    stats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalGroups: 0,
        totalPlayers: 0,
        nextSessionAt: null
    };
    recentCampaigns = [];
    recentGroups = [];
};
