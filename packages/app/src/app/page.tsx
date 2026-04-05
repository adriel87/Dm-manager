import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/infrastructure/presentation/components/ui/PageHeader";
import { DashboardStats } from "@/infrastructure/presentation/components/dashboard/DashboardStats";
import { RecentCampaigns } from "@/infrastructure/presentation/components/dashboard/RecentCampaigns";
import { RecentGroups } from "@/infrastructure/presentation/components/dashboard/RecentGroups";
import {
  DashboardStatsData,
  DashboardCampaign,
  DashboardGroup,
} from "@/domain/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | DM Manager",
  description: "Panel de control para gestionar tus campañas de rol.",
};

async function getDashboardData() {
  const [stats, campaigns, groups] = await Promise.all([
    apiGet<DashboardStatsData>("/api/dashboard/stats"),
    apiGet<DashboardCampaign[]>("/api/dashboard/recent-campaigns"),
    apiGet<DashboardGroup[]>("/api/dashboard/recent-groups"),
  ]);

  return {
    stats: stats ?? {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalGroups: 0,
      totalPlayers: 0,
      nextSessionAt: null,
    },
    campaigns: campaigns ?? [],
    groups: groups ?? [],
  };
}

export default async function Dashboard() {
  const { stats, campaigns, groups } = await getDashboardData();

  return (
    <section aria-labelledby="dashboard-heading">
      <PageHeader title="Dashboard" subtitle="Resumen de tu mesa de juego" />

      <div className="space-y-6">
        <section aria-label="Estadísticas">
          <DashboardStats initialData={stats} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section aria-label="Campañas recientes">
            <h2 className="text-lg font-semibold text-white mb-3">
              Campañas Recientes
            </h2>
            <RecentCampaigns initialData={campaigns} />
          </section>

          <section aria-label="Grupos recientes">
            <h2 className="text-lg font-semibold text-white mb-3">
              Grupos Recientes
            </h2>
            <RecentGroups initialData={groups} />
          </section>
        </div>
      </div>
    </section>
  );
}
