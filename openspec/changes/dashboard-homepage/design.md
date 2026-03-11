# Technical Design: Dashboard Homepage

## Status
Part of: dashboard-homepage change

## Overview

This document outlines the technical design for transforming the current campaign list homepage into a comprehensive dashboard that provides Dungeon Masters with quick stats and access to recent campaigns and groups.

## Technical Approach

Following the hexagonal architecture pattern established in the codebase:

### 1. Domain Layer Changes

#### 1.1 Add playerName to Character Entity

**File: `src/domain/character/character.ts`**

```typescript
export interface Character {
    id: string;
    name: string;
    age: AgeType;
    classType: DnDClassEnum;
    level: number;
    hitPoints: number;
    createdAt: Date;
    updatedAt: Date | undefined;
    description?: string;
    location?: string;
    isNPC?: boolean;
    playerName?: string;  // NEW: Real player's name for non-NPC characters
}
```

**File: `src/domain/character/characterRepository.ts`**

No changes needed - repository already supports full Character interface.

### 2. Infrastructure Layer Changes

#### 2.1 Update Character Mapper

**File: `src/infrastructure/adapters/mappers/character.mapper.ts`**

```typescript
export const characterMapper = {
    fromMongoDocumentToEntity: (doc: Document | WithId<Document>): CharacterEntity => {
        return new CharacterEntity(
            doc._id,
            doc.name,
            doc.age,
            doc.classType,
            doc.level,
            doc.hitPoints,
            new Date(doc.createdAt),
            doc.updatedAt,
            doc.description,
            doc.location,
            doc.isNPC,
            doc.playerName  // NEW
        );
    }
}
```

#### 2.2 Update Character Schema

**File: `src/infrastructure/adapters/schemas/character.schema.ts`**

```typescript
export const characterSchema = z.object({
    name: z.string().min(1),
    age: z.enum(AgeTypeEnum).default(AgeTypeEnum.adult),
    classType: dndEnum.default(DnDClassEnum.Normal),
    level: z.number().int().min(1).default(1),
    hitPoints: z.number().int().min(1).default(10),
    createdAt: z.date().default(() => new Date()),
    description: z.string().optional(),
    location: z.string().optional(),
    isNPC: z.boolean().optional().default(false),
    playerName: z.string().optional(),  // NEW
    updatedAt: z.date().optional().default(undefined)
});
```

### 3. Application Layer - Dashboard Use Cases

#### 3.1 Dashboard Types

**New File: `src/domain/dashboard/dashboard.ts`**

```typescript
export interface DashboardStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalGroups: number;
    totalPlayers: number;  // Non-NPC characters with playerName
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
```

#### 3.2 Dashboard Repository Interface

**New File: `src/domain/dashboard/dashboardRepository.ts`**

```typescript
import { DashboardStats, DashboardCampaign, DashboardGroup } from "./dashboard";

export interface DashboardRepository {
    getStats(): Promise<DashboardStats>;
    getRecentCampaigns(limit?: number): Promise<DashboardCampaign[]>;
    getRecentGroups(limit?: number): Promise<DashboardGroup[]>;
}
```

#### 3.3 Dashboard Use Cases

**New File: `src/application/useCases/dashboard/index.ts`**

```typescript
import { DashboardStats, DashboardCampaign, DashboardGroup } from "@/domain/dashboard/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";

export const getDashboardStats = async (
    repository: DashboardRepository
): Promise<DashboardStats> => {
    try {
        return await repository.getStats();
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
};

export const getRecentCampaigns = async (
    repository: DashboardRepository,
    limit: number = 5
): Promise<DashboardCampaign[]> => {
    try {
        return await repository.getRecentCampaigns(limit);
    } catch (error) {
        console.error("Error fetching recent campaigns:", error);
        throw new Error("Failed to fetch recent campaigns");
    }
};

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
```

### 4. Infrastructure Layer - Dashboard Repository Implementation

**New File: `src/infrastructure/adapters/repositories/mongo/dashboard.repository.ts`**

```typescript
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";
import { DashboardStats, DashboardCampaign, DashboardGroup, DashboardGroupMember } from "@/domain/dashboard/dashboard";
import { getCollection } from "@/infrastructure/config/mongodb";
import { Group } from "@/domain/group/group";

const LIMIT = 5;

export const dashboardRepository: DashboardRepository = {
    async getStats(): Promise<DashboardStats> {
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
            id: c._id,
            name: c.name,
            status: c.status,
            sessions: c.sessions,
            groupName: c.groups?.[0]?.name ?? 'Sin grupo',
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
            id: g._id,
            name: g.name,
            createdAt: g.createdAt,
            members: (g.members || []).map((m: any): DashboardGroupMember => ({
                playerName: m.playerName,
                characterName: m.name,
                classType: m.classType,
                level: m.level
            }))
        }));
    }
};
```

#### 4.1 Register Dashboard Repository

**File: `src/infrastructure/config/repositories.ts`**

```typescript
import { dashboardRepository } from "@/infrastructure/adapters/repositories/mongo/dashboard.repository";

export const repositories = {
    campaign: useMemory ? campaignMemoryRepository : campaignRepository,
    character: useMemory ? characterMemoryRepository : characterRepository,
    group: useMemory ? groupMemoryRepository : groupRepository,
    mission: useMemory ? missionMemoryRepository : missionRepository,
    session: useMemory ? sessionMemoryRepository : sessionRepository,
    dashboard: dashboardRepository,  // NEW
};
```

### 5. API Layer

#### 5.1 Dashboard Stats Endpoint

**New File: `src/app/api/dashboard/stats/route.ts`**

```typescript
import { getDashboardStats } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
    const stats = await getDashboardStats(repositories.dashboard);
    return NextResponse.json(stats);
}
```

#### 5.2 Dashboard Recent Campaigns Endpoint

**New File: `src/app/api/dashboard/recent-campaigns/route.ts`**

```typescript
import { getRecentCampaigns } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '5', 10);
    const campaigns = await getRecentCampaigns(repositories.dashboard, limit);
    return NextResponse.json(campaigns);
}
```

#### 5.3 Dashboard Recent Groups Endpoint

**New File: `src/app/api/dashboard/recent-groups/route.ts`**

```typescript
import { getRecentGroups } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '5', 10);
    const groups = await getRecentGroups(repositories.dashboard, limit);
    return NextResponse.json(groups);
}
```

### 6. Presentation Layer

#### 6.1 Dashboard Stats Component

**New File: `src/components/dashboard/DashboardStats.tsx`**

```typescript
'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { useAsync } from '@/hooks/useAsync';
import { DashboardStats as DashboardStatsType } from '@/domain/dashboard/dashboard';

interface DashboardStatsProps {
    initialData: DashboardStatsType;
}

export function DashboardStats({ initialData }: DashboardStatsProps) {
    const { data } = useAsync<DashboardStatsType>('/api/dashboard/stats', {
        fallbackData: initialData,
        revalidateOnMount: true
    });

    const stats = [
        { label: 'Total Campañas', value: data?.totalCampaigns ?? 0 },
        { label: 'Activas', value: data?.activeCampaigns ?? 0 },
        { label: 'Grupos', value: data?.totalGroups ?? 0 },
        { label: 'Jugadores', value: data?.totalPlayers ?? 0 },
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
```

#### 6.2 Recent Campaigns Component

**New File: `src/components/dashboard/RecentCampaigns.tsx`**

```typescript
'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { CalendarIcon, BookIcon } from '@/components/icons';
import { useAsync } from '@/hooks/useAsync';
import { DashboardCampaign } from '@/domain/dashboard/dashboard';
import { formatDate } from '@/utils/formatDate';
import { STATUS_COLOR } from '@/constants/ui';

interface RecentCampaignsProps {
    initialData: DashboardCampaign[];
}

export function RecentCampaigns({ initialData }: RecentCampaignsProps) {
    const { data } = useAsync<DashboardCampaign[]>('/api/dashboard/recent-campaigns', {
        fallbackData: initialData
    });

    return (
        <div className="space-y-3">
            {data?.map((campaign) => (
                <Card key={campaign.id} className="bg-zinc-800 border border-zinc-700">
                    <CardHeader className="flex items-center justify-between pb-2">
                        <h3 className="text-white font-semibold">{campaign.name}</h3>
                        <Chip size="sm" color={STATUS_COLOR[campaign.status]} variant="flat">
                            {campaign.status}
                        </Chip>
                    </CardHeader>
                    <CardBody className="pt-0 text-sm text-zinc-400">
                        <p>Grupo: {campaign.groupName}</p>
                        <div className="flex gap-4 mt-2">
                            <span className="flex items-center gap-1">
                                <BookIcon size={14} />
                                {campaign.sessions} sesiones
                            </span>
                            {campaign.nextSessionAt && (
                                <span className="flex items-center gap-1">
                                    <CalendarIcon size={14} />
                                    {formatDate(campaign.nextSessionAt)}
                                </span>
                            )}
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
```

#### 6.3 Recent Groups Component

**New File: `src/components/dashboard/RecentGroups.tsx`**

```typescript
'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { useAsync } from '@/hooks/useAsync';
import { DashboardGroup } from '@/domain/dashboard/dashboard';

interface RecentGroupsProps {
    initialData: DashboardGroup[];
}

export function RecentGroups({ initialData }: RecentGroupsProps) {
    const { data } = useAsync<DashboardGroup[]>('/api/dashboard/recent-groups', {
        fallbackData: initialData
    });

    return (
        <div className="space-y-3">
            {data?.map((group) => (
                <Card key={group.id} className="bg-zinc-800 border border-zinc-700">
                    <CardHeader>
                        <h3 className="text-white font-semibold">{group.name}</h3>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <ul className="space-y-2">
                            {group.members.map((member, idx) => (
                                <li key={idx} className="text-sm">
                                    <span className="text-zinc-300">{member.characterName}</span>
                                    {member.playerName && (
                                        <span className="text-zinc-500 text-xs ml-2">
                                            ({member.playerName})
                                        </span>
                                    )}
                                    <span className="text-zinc-400 ml-2">
                                        Lv. {member.level} {member.classType}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
```

#### 6.4 Updated Homepage

**File: `src/app/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { fetchApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentCampaigns } from '@/components/dashboard/RecentCampaigns';
import { RecentGroups } from '@/components/dashboard/RecentGroups';
import { DashboardStats as DashboardStatsType, DashboardCampaign, DashboardGroup } from '@/domain/dashboard/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | DM Manager',
  description: 'Panel de control para gestionar tus campañas de rol.',
};

async function getDashboardData() {
    const [stats, campaigns, groups] = await Promise.all([
        fetchApi<DashboardStatsType>('/api/dashboard/stats'),
        fetchApi<DashboardCampaign[]>('/api/dashboard/recent-campaigns'),
        fetchApi<DashboardGroup[]>('/api/dashboard/recent-groups'),
    ]);

    return {
        stats: stats ?? { totalCampaigns: 0, activeCampaigns: 0, totalGroups: 0, totalPlayers: 0, nextSessionAt: null },
        campaigns: campaigns ?? [],
        groups: groups ?? []
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
                        <h2 className="text-lg font-semibold text-white mb-3">Campañas Recientes</h2>
                        <RecentCampaigns initialData={campaigns} />
                    </section>

                    <section aria-label="Grupos recientes">
                        <h2 className="text-lg font-semibold text-white mb-3">Grupos Recientes</h2>
                        <RecentGroups initialData={groups} />
                    </section>
                </div>
            </div>
        </section>
    );
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  DashboardStats │  │ RecentCampaigns  │  │    RecentGroups          │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────────┬─────────────┘  │
│           │                    │                          │                 │
│           └────────────────────┼──────────────────────────┘                 │
│                                │                                            │
│                    ┌───────────▼───────────┐                               │
│                    │   src/app/page.tsx   │                               │
│                    │   (Server Component) │                               │
│                    └───────────┬───────────┘                               │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │ fetchApi()
┌────────────────────────────────┼────────────────────────────────────────────┐
│                    API LAYER  ▼                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ /api/dashboard/ │  │ /api/dashboard/   │  │ /api/dashboard/          │  │
│  │    stats        │  │ recent-campaigns  │  │ recent-groups           │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────────┬─────────────┘  │
│           │                    │                          │                 │
│           └────────────────────┼──────────────────────────┘                 │
│                                │                                            │
│                    ┌───────────▼───────────┐                               │
│                    │   Use Cases Layer      │                               │
│                    │ getDashboardStats()    │                               │
│                    │ getRecentCampaigns()  │                               │
│                    │ getRecentGroups()      │                               │
│                    └───────────┬───────────┘                               │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                    ┌───────────▼───────────┐                               │
│                    │ DashboardRepository   │   APPLICATION LAYER           │
│                    │     (Interface)       │                               │
│                    └───────────┬───────────┘                               │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                    ┌───────────▼───────────┐      INFRASTRUCTURE LAYER      │
│                    │ dashboardRepository   │                               │
│                    │  (MongoDB impl)       │                               │
│                    └───────────┬───────────┘                               │
│                                │                                            │
│           ┌────────────────────┼────────────────────┐                      │
│           ▼                    ▼                    ▼                       │
│  ┌─────────────┐     ┌──────────────┐    ┌──────────────┐                │
│  │  campaigns  │     │    groups    │    │  characters  │                │
│  │  collection │     │  collection  │    │  collection  │                │
│  └─────────────┘     └──────────────┘    └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Changes Table

| File | Action | Description |
|------|--------|-------------|
| `src/domain/character/character.ts` | Modify | Add `playerName?: string` field |
| `src/domain/character/characterRepository.ts` | Modify | Add `playerName` to entity reference in create/update |
| `src/infrastructure/adapters/mappers/character.mapper.ts` | Modify | Map `playerName` from MongoDB document |
| `src/infrastructure/adapters/schemas/character.schema.ts` | Modify | Add `playerName` to Zod schema |
| `src/domain/dashboard/dashboard.ts` | New | Dashboard types (Stats, Campaign, Group) |
| `src/domain/dashboard/dashboardRepository.ts` | New | Dashboard repository interface |
| `src/application/useCases/dashboard/index.ts` | New | Dashboard use cases |
| `src/infrastructure/adapters/repositories/mongo/dashboard.repository.ts` | New | MongoDB implementation |
| `src/infrastructure/config/repositories.ts` | Modify | Register dashboard repository |
| `src/app/api/dashboard/stats/route.ts` | New | Stats API endpoint |
| `src/app/api/dashboard/recent-campaigns/route.ts` | New | Recent campaigns endpoint |
| `src/app/api/dashboard/recent-groups/route.ts` | New | Recent groups endpoint |
| `src/components/dashboard/DashboardStats.tsx` | New | Stats display component |
| `src/components/dashboard/RecentCampaigns.tsx` | New | Recent campaigns component |
| `src/components/dashboard/RecentGroups.tsx` | New | Recent groups component |
| `src/app/page.tsx` | Modify | Replace with dashboard layout |

## Interface Contracts

### DashboardStats
```typescript
interface DashboardStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalGroups: number;
    totalPlayers: number;
    nextSessionAt: Date | null;
}
```

### DashboardCampaign
```typescript
interface DashboardCampaign {
    id: string;
    name: string;
    status: 'Activa' | 'Pausada' | 'Finalizada';
    sessions: number;
    groupName: string;
    nextSessionAt: Date | null;
    lastSessionAt: Date | null;
}
```

### DashboardGroup
```typescript
interface DashboardGroup {
    id: string;
    name: string;
    members: DashboardGroupMember[];
    createdAt: Date;
}

interface DashboardGroupMember {
    playerName?: string;
    characterName: string;
    classType: string;
    level: number;
}
```

## Testing Strategy

### Unit Tests

**New File: `__test__/application/usaCases/dashboard/useCases.test.ts`**

```typescript
import { getDashboardStats, getRecentCampaigns, getRecentGroups } from "@/application/useCases/dashboard";
import { DashboardRepository } from "@/domain/dashboard/dashboardRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Dashboard use cases", () => {
    const mockDashboardRepository: DashboardRepository = {
        getStats: vi.fn(),
        getRecentCampaigns: vi.fn(),
        getRecentGroups: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDashboardStats", () => {
        it("should return dashboard stats", async () => {
            vi.mocked(mockDashboardRepository.getStats).mockResolvedValue({
                totalCampaigns: 5,
                activeCampaigns: 3,
                totalGroups: 2,
                totalPlayers: 8,
                nextSessionAt: new Date()
            });
            
            const result = await getDashboardStats(mockDashboardRepository);
            
            expect(result.totalCampaigns).toBe(5);
            expect(result.activeCampaigns).toBe(3);
        });
    });

    describe("getRecentCampaigns", () => {
        it("should return recent campaigns with default limit", async () => {
            vi.mocked(mockDashboardRepository.getRecentCampaigns).mockResolvedValue([]);
            
            await getRecentCampaigns(mockDashboardRepository);
            
            expect(mockDashboardRepository.getRecentCampaigns).toHaveBeenCalledWith(5);
        });

        it("should return recent campaigns with custom limit", async () => {
            vi.mocked(mockDashboardRepository.getRecentCampaigns).mockResolvedValue([]);
            
            await getRecentCampaigns(mockDashboardRepository, 10);
            
            expect(mockDashboardRepository.getRecentCampaigns).toHaveBeenCalledWith(10);
        });
    });

    describe("getRecentGroups", () => {
        it("should return recent groups", async () => {
            vi.mocked(mockDashboardRepository.getRecentGroups).mockResolvedValue([]);
            
            await getRecentGroups(mockDashboardRepository);
            
            expect(mockDashboardRepository.getRecentGroups).toHaveBeenCalledWith(5);
        });
    });
});
```

### Component Tests

- Test DashboardStats renders with correct values
- Test RecentCampaigns renders campaign cards correctly
- Test RecentGroups renders member details correctly
- Test empty states for all components

### Integration Tests

- Test API endpoints return correct data shape
- Test dashboard loads within 2 seconds (performance requirement)

## Migration Plan

### Database Migration

No migration required - `playerName` is an optional field that defaults to undefined/null. Existing characters will work without modification.

### Backwards Compatibility

1. **Character Schema**: `playerName` is optional - existing API calls will continue to work
2. **Dashboard API**: New endpoints - no breaking changes
3. **Homepage**: Replaces existing page but maintains same route (`/`) - users may need to refresh

### Deployment Steps

1. Deploy domain layer changes (character entity, schema, mapper)
2. Deploy infrastructure changes (dashboard repository)
3. Deploy API endpoints
4. Deploy presentation layer (dashboard components)
5. Deploy updated homepage

## Acceptance Criteria

- [ ] Dashboard stats block shows total campaigns count
- [ ] Dashboard stats block shows active campaigns count (status = 'Activa')
- [ ] Dashboard stats block shows total groups count
- [ ] Dashboard stats block shows total human players (non-NPC characters with playerName)
- [ ] Dashboard stats block shows next session date (earliest from active campaigns)
- [ ] Recent campaigns shows up to 5 campaigns sorted by lastSessionAt DESC
- [ ] Each campaign card shows: title, state, group name, sessions count, next/last session
- [ ] Recent groups shows up to 5 groups sorted by createdAt DESC
- [ ] Each group shows all members with player name, character name, class, level
- [ ] Dashboard loads within 2 seconds
- [ ] API endpoints return proper JSON responses
- [ ] All existing tests pass

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-------------|
| Large datasets impact performance | Medium | Medium | Added limit(5) to queries; can add pagination later |
| Group members don't have level/class | Low | Medium | Dashboard query fetches member details; repository handles missing data |
| Date handling across timezones | Low | Low | Store as Date objects; format on client |
