'use client';

import { useTransition } from 'react';
import { Card, CardBody, CardHeader, Chip, Select, SelectItem } from '@heroui/react';
import { STATUS_COLOR, PRIORITY_COLOR, SELECT_CLASSES } from '@/constants/ui';
import { STATUS_OPTIONS } from '@/constants/domain';
import { apiPut } from '@/lib/api';
import { ChevronRightIcon } from '@/infrastructure/presentation/components/icons';

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

interface MissionPlayCardProps {
  campaignId: string;
  mission: EmbeddedMission;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (missionId: string, newStatus: MissionStatusType) => void;
}

/** Maps difficulty string to a Chip color */
function difficultyColor(difficult: string): 'danger' | 'warning' | 'default' | 'primary' {
  const d = difficult.toLowerCase();
  if (d === 'alta' || d === 'hard' || d === 'difícil') return 'danger';
  if (d === 'media' || d === 'medium' || d === 'normal') return 'warning';
  if (d === 'baja' || d === 'easy' || d === 'fácil') return 'primary';
  return 'default';
}

/**
 * Expandable mission card for Play Mode.
 * Shows mission name, priority and status when collapsed.
 * Expands to reveal missionGuide and missionEvents for reference during play.
 * Includes inline status toggle (Select) to change mission status mid-session.
 */
export function MissionPlayCard({
  campaignId,
  mission,
  isExpanded,
  onToggleExpand,
  onStatusChange,
}: MissionPlayCardProps) {
  const [isPending, startTransition] = useTransition();

  const statusColor = STATUS_COLOR[mission.status] ?? STATUS_COLOR['Finalizada'];
  const priorityLabel = mission.missionPriority ?? 'Baja';
  const priorityColor = PRIORITY_COLOR[priorityLabel] ?? PRIORITY_COLOR['Baja'];
  const hasEvents = mission.missionEvents && mission.missionEvents.length > 0;

  function handleStatusChange(newStatus: MissionStatusType) {
    if (newStatus === mission.status) return;

    startTransition(async () => {
      const { error } = await apiPut(
        `/api/campaign/${campaignId}/missions/${mission.id}`,
        {
          id: mission.id,
          name: mission.name,
          description: mission.description,
          missionGuide: mission.missionGuide,
          missionEvents: mission.missionEvents,
          missionPriority: mission.missionPriority,
          rewards: mission.rewards ?? null,
          relatedCharacters: mission.relatedCharacters,
          status: newStatus,
        }
      );
      if (!error) {
        onStatusChange(mission.id, newStatus);
      }
    });
  }

  return (
    <Card
      className={`bg-zinc-800 border transition-all duration-200 ${
        isExpanded ? 'border-primary-500/40' : 'border-zinc-700 hover:border-zinc-600'
      } ${mission.status === 'Finalizada' ? 'opacity-60' : ''}`}
      shadow="none"
    >
      {/* ── Header — always visible ── */}
      <CardHeader className="flex items-start gap-3 pb-2">
        {/* Expand toggle button */}
        <button
          onClick={onToggleExpand}
          className="flex-1 min-w-0 text-left"
          aria-expanded={isExpanded}
          aria-controls={`mission-body-${mission.id}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <ChevronRightIcon
              size={14}
              className={`text-zinc-500 shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
              {mission.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 pl-5">
            <Chip size="sm" color={priorityColor} variant="flat" className="text-xs">
              {priorityLabel}
            </Chip>
            <Chip size="sm" color={statusColor} variant="flat" className="text-xs">
              {mission.status}
            </Chip>
            {hasEvents && (
              <span className="text-zinc-500 text-xs">
                {mission.missionEvents!.length} evento{mission.missionEvents!.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </button>

        {/* Status toggle — stop propagation so it doesn't trigger expand */}
        <div
          className="shrink-0 w-32"
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            aria-label="Cambiar estado de la misión"
            selectedKeys={[mission.status]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as MissionStatusType;
              if (selected) handleStatusChange(selected);
            }}
            isDisabled={isPending}
            size="sm"
            classNames={SELECT_CLASSES}
          >
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>
      </CardHeader>

      {/* ── Body — visible when expanded ── */}
      {isExpanded && (
        <CardBody
          id={`mission-body-${mission.id}`}
          className="pt-3 border-t border-zinc-700/60 flex flex-col gap-4"
        >
          {/* Mission Guide */}
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1.5">
              Guía del DM
            </p>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {mission.missionGuide || 'Sin guía definida.'}
            </p>
          </div>

          {/* Mission Events */}
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1.5">
              Eventos
            </p>
            {hasEvents ? (
              <ul className="flex flex-col gap-2" role="list">
                {mission.missionEvents!.map((event, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-zinc-900/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-300 text-sm">{event.name}</span>
                    <Chip
                      size="sm"
                      color={difficultyColor(event.difficult)}
                      variant="flat"
                      className="text-xs shrink-0"
                    >
                      {event.difficult}
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm">Sin eventos definidos.</p>
            )}
          </div>

          {/* Related Characters */}
          {mission.relatedCharacters && mission.relatedCharacters.length > 0 && (
            <div>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1.5">
                Personajes relacionados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mission.relatedCharacters.map((char) => (
                  <Chip key={char.id} size="sm" variant="bordered" className="text-xs text-zinc-300 border-zinc-600">
                    {char.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}
