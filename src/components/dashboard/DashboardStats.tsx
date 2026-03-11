'use client';

import { Card, CardBody } from '@heroui/react';
import { DashboardStats as DashboardStatsType } from '@/domain/dashboard/dashboard';

interface DashboardStatsProps {
    initialData: DashboardStatsType;
}

export function DashboardStats({ initialData }: DashboardStatsProps) {
    const stats = [
        { label: 'Total Campañas', value: initialData?.totalCampaigns ?? 0 },
        { label: 'Activas', value: initialData?.activeCampaigns ?? 0 },
        { label: 'Grupos', value: initialData?.totalGroups ?? 0 },
        { label: 'Jugadores', value: initialData?.totalPlayers ?? 0 },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="bg-zinc-800 border border-zinc-700">
                    <CardBody className="text-center">
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-zinc-400">{stat.label}</p>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
