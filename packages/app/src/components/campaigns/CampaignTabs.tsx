'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { apiGet } from '@/lib/api';
import type { EmbeddedItem, GroupSnapshot } from '@/domain/campaign/campaign';
import { Mission } from '@/domain/mission/mission';
import { Session } from '@/domain/session/session';
import { CreateMissionButton } from '@/infrastructure/presentation/components/campaigns/CreateMissionButton';
import { MissionItem } from '@/infrastructure/presentation/components/campaigns/MissionItem';
import { CreateSessionButton } from '@/infrastructure/presentation/components/campaigns/CreateSessionButton';
import { SessionItem } from '@/infrastructure/presentation/components/campaigns/SessionItem';
import { GroupItem } from '@/infrastructure/presentation/components/campaigns/GroupItem';
import { TransferMoneyButton } from '@/infrastructure/presentation/components/campaigns/TransferMoneyButton';
import { CreateInventoryItemButton } from '@/infrastructure/presentation/components/campaigns/CreateInventoryItemButton';
import { InventoryItem } from '@/infrastructure/presentation/components/campaigns/InventoryItem';

interface Inventory {
  items: EmbeddedItem[];
  capacity: number;
  money: number;
}

interface CampaignTabsProps {
  campaignId: string;
}

interface CampaignData {
  missions: Mission[];
  sessions: Session[];
  inventory: Inventory;
  group: GroupSnapshot | null;
}

interface TabData {
  missions: Mission[];
  sessions: Session[];
  group: GroupSnapshot | null;
  inventory: Inventory;
}

type LoadingState = 'idle' | 'loading' | 'error' | 'done';

/** Skeleton card used while tab data is loading — prevents layout shift. */
function SkeletonCard() {
  return (
    <div
      className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 animate-pulse"
      aria-hidden="true"
    >
      <div className="h-4 bg-zinc-700 rounded w-2/3 mb-3" />
      <div className="h-3 bg-zinc-700 rounded w-full mb-2" />
      <div className="h-3 bg-zinc-700 rounded w-4/5" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Cargando...">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

interface EmptyTabStateProps {
  label: string;
  hint: string;
}

function EmptyTabState({ label, hint }: EmptyTabStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-500"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-white text-base font-semibold mb-1">{label}</h3>
      <p className="text-zinc-400 text-sm max-w-xs">{hint}</p>
    </div>
  );
}

interface ErrorTabStateProps {
  onRetry: () => void;
}

function ErrorTabState({ onRetry }: ErrorTabStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-zinc-400 text-sm mb-3">No se pudo cargar la información.</p>
      <button
        onClick={onRetry}
        className="text-primary-400 text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
      >
        Reintentar
      </button>
    </div>
  );
}

/**
 * Client Component island — handles tab navigation + lazy data fetching.
 *
 * Architecture note: a single GET /api/campaign/:id returns the full aggregate
 * (missions, sessions, inventory, group). Each tab refreshes by re-fetching
 * that single endpoint and extracting its slice.
 */
export function CampaignTabs({ campaignId }: CampaignTabsProps) {
  const [data, setData] = useState<TabData>({ missions: [], sessions: [], group: null, inventory: { items: [], capacity: 0, money: 0 } });
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const loadAll = useCallback(async () => {
    setLoadingState('loading');
    try {
      const campaign = await apiGet<CampaignData>(`/api/campaign/${campaignId}`);
      if (!campaign) throw new Error('Failed to load');

      setData({
        missions: campaign.missions ?? [],
        sessions: (campaign.sessions ?? []).sort((a, b) => b.sessionNumber - a.sessionNumber),
        group: campaign.group ?? null,
        inventory: campaign.inventory ?? { items: [], capacity: 0, money: 0 },
      });
      setLoadingState('done');
    } catch {
      setLoadingState('error');
    }
  }, [campaignId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshMissions = useCallback(async () => {
    const campaign = await apiGet<CampaignData>(`/api/campaign/${campaignId}`);
    if (!campaign) return;
    setData((prev) => ({ ...prev, missions: campaign.missions ?? [] }));
  }, [campaignId]);

  const refreshSessions = useCallback(async () => {
    const campaign = await apiGet<CampaignData>(`/api/campaign/${campaignId}`);
    if (!campaign) return;
    const sessions = (campaign.sessions ?? []).sort((a, b) => b.sessionNumber - a.sessionNumber);
    setData((prev) => ({ ...prev, sessions }));
  }, [campaignId]);

  const refreshInventory = useCallback(async () => {
    const campaign = await apiGet<CampaignData>(`/api/campaign/${campaignId}`);
    if (!campaign) return;
    setData((prev) => ({ ...prev, inventory: campaign.inventory ?? prev.inventory }));
  }, [campaignId]);

  const isLoading = loadingState === 'loading' || loadingState === 'idle';
  const isError = loadingState === 'error';

  return (
    <div className="mt-2">
      <Tabs
        aria-label="Secciones de la campaña"
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            'border-b border-zinc-800 w-full pb-0 gap-6',
          tab: 'text-zinc-400 data-[selected=true]:text-white font-medium pb-3',
          cursor: 'bg-primary-500',
          panel: 'pt-6',
        }}
      >
        {/* ── Misiones ── */}
        <Tab key="missions" title="Misiones">
          <section aria-labelledby="missions-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="missions-heading"
                className="text-white text-lg font-semibold"
              >
                Misiones
                {!isLoading && !isError && (
                  <span className="text-zinc-500 text-sm font-normal ml-2">
                    ({data.missions.length})
                  </span>
                )}
              </h2>
              <CreateMissionButton campaignId={campaignId} onCreated={refreshMissions} />
            </div>

            {isLoading && <SkeletonList />}

            {isError && <ErrorTabState onRetry={loadAll} />}

            {!isLoading && !isError && data.missions.length === 0 && (
              <EmptyTabState
                label="Sin misiones todavía"
                hint='Pulsa "+ Nueva misión" para añadir la primera misión a esta campaña.'
              />
            )}

            {!isLoading && !isError && data.missions.length > 0 && (
              <ul className="flex flex-col gap-3" role="list" aria-label="Lista de misiones">
                {data.missions.map((mission) => (
                  <li key={mission.id}>
                    <MissionItem campaignId={campaignId} mission={mission} onUpdated={refreshMissions} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Tab>

        {/* ── Sesiones ── */}
        <Tab key="sessions" title="Sesiones">
          <section aria-labelledby="sessions-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="sessions-heading"
                className="text-white text-lg font-semibold"
              >
                Sesiones
                {!isLoading && !isError && (
                  <span className="text-zinc-500 text-sm font-normal ml-2">
                    ({data.sessions.length})
                  </span>
                )}
              </h2>
              <CreateSessionButton campaignId={campaignId} onCreated={refreshSessions} />
            </div>

            {isLoading && <SkeletonList />}

            {isError && <ErrorTabState onRetry={loadAll} />}

            {!isLoading && !isError && data.sessions.length === 0 && (
              <EmptyTabState
                label="Sin sesiones todavía"
                hint='Pulsa "+ Nueva sesión" para registrar la primera sesión jugada.'
              />
            )}

            {!isLoading && !isError && data.sessions.length > 0 && (
              <ul className="flex flex-col gap-3" role="list" aria-label="Lista de sesiones">
                {data.sessions.map((session) => (
                  <li key={session.id}>
                    <SessionItem session={session} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Tab>

        {/* ── Grupo ── */}
        <Tab key="groups" title="Grupo">
          <section aria-labelledby="groups-heading">
            <h2 id="groups-heading" className="text-white text-lg font-semibold mb-4">
              Grupo
            </h2>

            {isLoading && <SkeletonList />}

            {isError && <ErrorTabState onRetry={loadAll} />}

            {!isLoading && !isError && !data.group && (
              <EmptyTabState
                label="Sin grupo asignado"
                hint="Los grupos se asignan a la campaña desde la pantalla de gestión de grupos."
              />
            )}

            {!isLoading && !isError && data.group && (
              <GroupItem group={data.group} />
            )}
          </section>
        </Tab>

        {/* ── Inventario ── */}
        <Tab key="inventory" title="Inventario">
          <section aria-labelledby="inventory-heading">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2
                  id="inventory-heading"
                  className="text-white text-lg font-semibold"
                >
                  Inventario
                  {!isLoading && !isError && (
                    <span className="text-zinc-500 text-sm font-normal ml-2">
                      ({data.inventory.items.length})
                    </span>
                  )}
                </h2>
                {!isLoading && !isError && (
                  <span className={`text-sm font-medium ${data.inventory.money < 0 ? 'text-danger-400' : 'text-warning-400'}`}>
                    {data.inventory.money} gp
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <TransferMoneyButton campaignId={campaignId} onTransferred={refreshInventory} />
                <CreateInventoryItemButton campaignId={campaignId} onCreated={refreshInventory} />
              </div>
            </div>

            {!isLoading && !isError && data.inventory.capacity > 0 && (
              <p className="text-zinc-500 text-xs mb-4">
                Capacidad:{' '}
                <span className="text-zinc-400">
                  {data.inventory.items.length} / {data.inventory.capacity} slots
                </span>
              </p>
            )}

            {isLoading && <SkeletonList />}

            {isError && <ErrorTabState onRetry={loadAll} />}

            {!isLoading && !isError && data.inventory.items.length === 0 && (
              <EmptyTabState
                label="Sin objetos todavía"
                hint='Pulsa "+ Nuevo objeto" para añadir el primer objeto al inventario.'
              />
            )}

            {!isLoading && !isError && data.inventory.items.length > 0 && (
              <ul className="flex flex-col gap-3" role="list" aria-label="Lista de objetos del inventario">
                {data.inventory.items.map((item) => (
                  <li key={item.id}>
                    <InventoryItem campaignId={campaignId} item={item} onUpdated={refreshInventory} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Tab>
      </Tabs>
    </div>
  );
}
