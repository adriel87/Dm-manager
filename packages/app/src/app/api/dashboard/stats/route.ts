import { getDashboardStats } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/stats
 * Returns global statistics for the dashboard
 * 
 * TODO (FR-14): Add totalMissions and totalSessions fields to DashboardStatsData
 * Currently returns: totalCampaigns, activeCampaigns, totalGroups, totalPlayers, nextSessionAt
 */
export async function GET() {
    const stats = await getDashboardStats(repositories.dashboard);
    return NextResponse.json(stats);
}
