import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";
import { DashboardStatsData, DashboardCampaign, DashboardGroup, DashboardGroupMember } from "@/domain/dashboard/dashboard";
import { getCollection } from "@/infrastructure/config/mongodb";

const LIMIT = 5;

export const dashboardRepository: DashboardRepository = {
    async getStats(): Promise<DashboardStatsData> {
        const campaignCollection = await getCollection("campaigns");
        const groupCollection = await getCollection("groups");
        const characterCollection = await getCollection("characters");

        const [totalCampaigns, activeCampaigns, totalGroups, players] = await Promise.all([
            campaignCollection.countDocuments(),
            campaignCollection.countDocuments({ status: 'Activa' }),
            groupCollection.countDocuments(),
            characterCollection.countDocuments({ 
                isNPC: { $ne: true },
                playerName: { $exists: true, $ne: "" }
            })
        ]);

        // Compute totalMissions and totalSessions from aggregate campaign data
        const campaigns = await campaignCollection.find({}).toArray();
        const totalMissions = campaigns.reduce((sum, c) => sum + (c.missions?.length || 0), 0);
        const totalSessions = campaigns.reduce((sum, c) => sum + (c.sessions?.length || 0), 0);

        const nextSession = await campaignCollection
            .find({ status: 'Activa', nextSessionAt: { $exists: true } })
            .sort({ nextSessionAt: 1 })
            .limit(1)
            .toArray();

        return {
            totalCampaigns,
            activeCampaigns,
            totalGroups,
            totalPlayers: players,
            nextSessionAt: nextSession[0]?.nextSessionAt ?? null
        };
    },

    async getRecentCampaigns(limit: number = LIMIT): Promise<DashboardCampaign[]> {
        const campaignCollection = await getCollection("campaigns");
        
        const campaigns = await campaignCollection
            .find({})
            .sort({ lastSessionAt: -1, createdAt: -1 })
            .limit(limit)
            .toArray();

        return campaigns.map(c => ({
            id: c._id.toString(),
            name: c.name,
            status: c.status,
            sessions: c.sessions?.length || 0,  // sessions is now an array (aggregate)
            groupName: c.group?.name ?? 'Sin grupo',  // group is now a single GroupSnapshot
            nextSessionAt: c.nextSessionAt ?? null,
            lastSessionAt: c.lastSessionAt ?? null
        }));
    },

    async getRecentGroups(limit: number = LIMIT): Promise<DashboardGroup[]> {
        const groupCollection = await getCollection("groups");
        
        const groups = await groupCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return groups.map(g => ({
            id: g._id.toString(),
            name: g.name,
            createdAt: g.createdAt,
            members: (g.members || []).map((m: { playerName?: string; name: string; classType: string; level: number }): DashboardGroupMember => ({
                playerName: m.playerName,
                characterName: m.name,
                classType: m.classType,
                level: m.level
            }))
        }));
    }
};
