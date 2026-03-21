'use client';

import { useState } from 'react';
import { Switch } from '@heroui/react';
import { MissionPlayCard } from './MissionPlayCard';
import { FileTextIcon } from '@/infrastructure/presentation/components/icons';

type MissionStatusType = 'Activa' | 'Pausada' | 'Finalizada';

interface MissionEvent {
  name: string;
  difficult: string;
}

interface EmbeddedMission {
  id: string;
  name: string;
  description: string;
  missionGuide: string;
  missionEvents: MissionEvent[] | null;
  missionPriority: string;
  status: MissionStatusType;
  relatedCharacters: { id: string; name: string }[] | null;
  rewards?: string | null;
  startDate?: string;
  endDate?: string;
}

interface MissionPanelProps {
  campaignId: string;
  missions: EmbeddedMission[];
  expandedMissionId: string | null;
  onToggleExpand: (missionId: string) => void;
  onStatusChange: (missionId: string, newStatus: MissionStatusType) => void;
}

/**
 * Left panel of Play Mode — shows the mission list with filter toggle.
 * By default shows only "Activa" missions; toggle reveals all.
 * Each mission renders as a MissionPlayCard (expandable).
 */
export function MissionPanel({
  campaignId,
  missions,
  expandedMissionId,
  onToggleExpand,
  onStatusChange,
}: MissionPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleMissions = showAll
    ? missions
    : missions.filter((m) => m.status === 'Activa');

  const hiddenCount = missions.length - visibleMissions.length;

  return (
    <section
      className="flex flex-col h-full min-h-0"
      aria-labelledby="missions-panel-heading"
    >
      {/* ── Panel header ── */}
      <div className="sticky top-0 z-10 bg-zinc-900 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2
            id="missions-panel-heading"
            className="text-white text-base font-semibold"
          >
            Misiones
          </h2>
          <span className="text-zinc-500 text-sm">
            ({visibleMissions.length}
            {!showAll && hiddenCount > 0 && (
              <span className="text-zinc-600"> / {missions.length}</span>
            )}
            )
          </span>
        </div>

        <Switch
          isSelected={showAll}
          onValueChange={setShowAll}
          size="sm"
          aria-label="Mostrar todas las misiones"
          classNames={{
            label: 'text-zinc-400 text-sm',
          }}
        >
          Mostrar todas
        </Switch>
      </div>

      {/* ── Mission list ── */}
      <div className="flex-1 overflow-y-auto pr-1">
        {missions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <FileTextIcon size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">
              No hay misiones en esta campaña
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              Añade misiones desde la página de detalle de la campaña.
            </p>
          </div>
        )}

        {missions.length > 0 && visibleMissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-400 text-sm mb-2">
              No hay misiones activas.
            </p>
            <button
              onClick={() => setShowAll(true)}
              className="text-primary-400 text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              Mostrar todas las misiones ({missions.length})
            </button>
          </div>
        )}

        {visibleMissions.length > 0 && (
          <ul className="flex flex-col gap-3" role="list" aria-label="Lista de misiones">
            {visibleMissions.map((mission) => (
              <li key={mission.id}>
                <MissionPlayCard
                  campaignId={campaignId}
                  mission={mission}
                  isExpanded={expandedMissionId === mission.id}
                  onToggleExpand={() => onToggleExpand(mission.id)}
                  onStatusChange={onStatusChange}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
