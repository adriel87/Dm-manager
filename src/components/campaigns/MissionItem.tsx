'use client';

import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';

export interface Mission {
  id: string;
  name: string;
  description: string;
  missionGuide: string;
  missionPriority: string;
  status: 'Activa' | 'Pausada' | 'Finalizada';
  missionEvents?: { name: string; difficult: string }[];
  relatedCharacters?: { id: string; name: string }[];
  rewards?: string;
  startDate?: string;
  endDate?: string;
}

interface MissionItemProps {
  mission: Mission;
}

const statusConfig: Record<
  Mission['status'],
  { color: 'success' | 'warning' | 'default' }
> = {
  Activa: { color: 'success' },
  Pausada: { color: 'warning' },
  Finalizada: { color: 'default' },
};

const priorityConfig: Record<
  string,
  { color: 'danger' | 'warning' | 'default'; label: string }
> = {
  Alta: { color: 'danger', label: 'Alta' },
  Media: { color: 'warning', label: 'Media' },
  Baja: { color: 'default', label: 'Baja' },
};

/** Formats an ISO date string to a short Spanish locale date. */
function formatDate(isoString?: string): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Pure Server Component — displays a single mission card.
 * No interactivity required; all data is passed as props.
 */
export function MissionItem({ mission }: MissionItemProps) {
  const { color: statusColor } = statusConfig[mission.status] ?? statusConfig['Finalizada'];
  const priorityLabel = mission.missionPriority ?? 'Baja';
  const priority = priorityConfig[priorityLabel] ?? priorityConfig['Baja'];
  const startDate = formatDate(mission.startDate);
  const endDate = formatDate(mission.endDate);

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 flex-1">
          {mission.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Chip size="sm" color={priority.color} variant="flat" className="text-xs">
            {priority.label}
          </Chip>
          <Chip size="sm" color={statusColor} variant="flat" className="text-xs">
            {mission.status}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="py-2">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
          {mission.description || 'Sin descripción.'}
        </p>
      </CardBody>

      {(startDate || endDate) && (
        <CardFooter className="flex items-center gap-4 pt-2 border-t border-zinc-700">
          {startDate && (
            <span className="text-zinc-500 text-xs">
              Inicio: <span className="text-zinc-400">{startDate}</span>
            </span>
          )}
          {endDate && (
            <span className="text-zinc-500 text-xs">
              Fin: <span className="text-zinc-400">{endDate}</span>
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
