export interface DashboardStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalGroups: number;
    totalPlayers: number;
    nextSessionAt: Date | null;
}

export interface DashboardCampaign {
    id: string;
    name: string;
    status: 'Activa' | 'Pausada' | 'Finalizada';
    sessions: number;
    groupName: string;
    nextSessionAt: Date | null;
    lastSessionAt: Date | null;
}

export interface DashboardGroupMember {
    playerName?: string;
    characterName: string;
    classType: string;
    level: number;
}

export interface DashboardGroup {
    id: string;
    name: string;
    members: DashboardGroupMember[];
    createdAt: Date;
}
