'use client';

import { Card, CardBody, CardHeader, CardFooter } from '@heroui/react';
import { Chip } from '@heroui/react';
import Link from 'next/link';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'Activa' | 'Pausada' | 'Finalizada';
  sessions: number;
  nextSessionAt?: string;
  lastSessionAt?: string;
  groups: { id: string; name: string }[];
}

interface CampaignCardProps {
  campaign: Campaign;
}

const statusConfig: Record<
  Campaign['status'],
  { label: string; color: 'success' | 'warning' | 'default' }
> = {
  Activa: { label: 'Activa', color: 'success' },
  Pausada: { label: 'Pausada', color: 'warning' },
  Finalizada: { label: 'Finalizada', color: 'default' },
};

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/**
 * Formats an ISO date string to a human-readable short date.
 * Returns null if the date is invalid or not provided.
 */
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
 * Pure Server Component — no interactivity needed.
 * The entire card is wrapped in a Next.js Link for full-area clickability.
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
  const { label, color } = statusConfig[campaign.status] ?? statusConfig['Finalizada'];
  const nextSession = formatDate(campaign.nextSessionAt);

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
      aria-label={`Abrir campaña: ${campaign.name}`}
    >
      <Card
        className="bg-zinc-800 border border-zinc-700 group-hover:border-zinc-500 transition-colors duration-200 h-full"
        shadow="none"
      >
        <CardHeader className="flex items-start justify-between gap-3 pb-2">
          <h2 className="text-white font-semibold text-base leading-snug line-clamp-1">
            {campaign.name}
          </h2>
          <Chip
            size="sm"
            color={color}
            variant="flat"
            className="shrink-0 text-xs"
          >
            {label}
          </Chip>
        </CardHeader>

        <CardBody className="py-2">
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
            {campaign.description || 'Sin descripción.'}
          </p>
        </CardBody>

        <CardFooter className="flex items-center gap-4 pt-3 border-t border-zinc-700">
          {/* Session count */}
          <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <BookIcon />
            <span>
              {campaign.sessions}{' '}
              {campaign.sessions === 1 ? 'sesión' : 'sesiones'}
            </span>
          </span>

          {/* Next session date */}
          {nextSession && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <CalendarIcon />
              <span>{nextSession}</span>
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
