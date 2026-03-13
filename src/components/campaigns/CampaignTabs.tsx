'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { MissionItem, type Mission } from '@/components/campaigns/MissionItem';
import { SessionItem, type Session } from '@/components/campaigns/SessionItem';
import { GroupItem } from '@/components/campaigns/GroupItem';
import type { Group } from '@/domain/group/group';
import { CreateMissionButton } from '@/components/campaigns/CreateMissionButton';
import { CreateSessionButton } from '@/components/campaigns/CreateSessionButton';
import type { Campaign } from '@/components/campaigns/CampaignCard';

interface CampaignTabsProps {
  campaignId: string;
  campaign: Campaign;
}

interface TabData {
  missions: Mission[];
  sessions: Session[];
  groups: Group[];
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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Client Component island — handles tab navigation + lazy data fetching.
 *
 * Architecture note: data is fetched client-side here because:
 * 1. Tabs create natural lazy-loading boundaries (avoid fetching all data upfront)
 * 2. The Create buttons need to refresh only the relevant list, not the whole page
 *
 * All three datasets are fetched in parallel on mount to keep the UX fast,
 * and each tab can be independently refreshed after a create action.
 */
export function CampaignTabs({ campaignId, campaign }: CampaignTabsProps) {
  const [data, setData] = useState<TabData>({ missions: [], sessions: [], groups: [] });
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const campaignGroupIds = new Set(campaign.groups?.map((g) => g.id) ?? []);

  const loadAll = useCallback(async () => {
    setLoadingState('loading');
    try {
      const [rawMissions, rawSessions, rawGroups] = await Promise.all([
        fetchJson<Mission[] | { data: Mission[] }>(`${BASE}/api/mission`),
        fetchJson<Session[] | { data: Session[] }>(`${BASE}/api/session`),
        fetchJson<Group[] | { data: Group[] }>(`${BASE}/api/group`),
      ]);

      // Normalise — API may return plain array or { data: [...] }
      const missions = Array.isArray(rawMissions)
        ? rawMissions
        : (rawMissions as { data: Mission[] }).data ?? [];

      const sessions = (
        Array.isArray(rawSessions)
          ? rawSessions
          : (rawSessions as { data: Session[] }).data ?? []
      )
        .filter((s) => s.campaignId === campaignId)
        .sort((a, b) => b.sessionNumber - a.sessionNumber);

      const groups = (
        Array.isArray(rawGroups)
          ? rawGroups
          : (rawGroups as { data: Group[] }).data ?? []
      ).filter((g) => campaignGroupIds.has(g.id));

      setData({ missions, sessions, groups });
      setLoadingState('done');
    } catch {
      setLoadingState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshMissions = useCallback(async () => {
    try {
      const raw = await fetchJson<Mission[] | { data: Mission[] }>(`${BASE}/api/mission`);
      const missions = Array.isArray(raw) ? raw : (raw as { data: Mission[] }).data ?? [];
      setData((prev) => ({ ...prev, missions }));
    } catch {
      // Silent — list keeps stale data; user can still see what was there
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const raw = await fetchJson<Session[] | { data: Session[] }>(`${BASE}/api/session`);
      const sessions = (
        Array.isArray(raw) ? raw : (raw as { data: Session[] }).data ?? []
      )
        .filter((s) => s.campaignId === campaignId)
        .sort((a, b) => b.sessionNumber - a.sessionNumber);
      setData((prev) => ({ ...prev, sessions }));
    } catch {
      // Silent
    }
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
              <CreateMissionButton onCreated={refreshMissions} />
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
                    <MissionItem mission={mission} onUpdated={refreshMissions} />
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

        {/* ── Grupos ── */}
        <Tab key="groups" title="Grupos">
          <section aria-labelledby="groups-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="groups-heading"
                className="text-white text-lg font-semibold"
              >
                Grupos
                {!isLoading && !isError && (
                  <span className="text-zinc-500 text-sm font-normal ml-2">
                    ({data.groups.length})
                  </span>
                )}
              </h2>
            </div>

            {isLoading && <SkeletonList />}

            {isError && <ErrorTabState onRetry={loadAll} />}

            {!isLoading && !isError && data.groups.length === 0 && (
              <EmptyTabState
                label="Sin grupos asignados"
                hint="Los grupos se asignan a la campaña desde la pantalla de gestión de grupos."
              />
            )}

            {!isLoading && !isError && data.groups.length > 0 && (
              <ul className="flex flex-col gap-3" role="list" aria-label="Lista de grupos">
                {data.groups.map((group) => (
                  <li key={group.id}>
                    <GroupItem group={group} />
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
