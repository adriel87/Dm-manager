'use client';

import Link from 'next/link';
import { Chip } from '@heroui/react';
import type { Campaign } from '@/components/campaigns/CampaignCard';

interface CampaignDetailHeaderProps {
  campaign: Campaign;
}

const statusConfig: Record<
  Campaign['status'],
  { color: 'success' | 'warning' | 'default' }
> = {
  Activa: { color: 'success' },
  Pausada: { color: 'warning' },
  Finalizada: { color: 'default' },
};

/** Formats an ISO date string to a short Spanish locale date. */
function formatDate(isoString?: string): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
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

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
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

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Server Component — static campaign header.
 * Shows navigation breadcrumb, title, status, description, and stat row.
 */
export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const { color } = statusConfig[campaign.status] ?? statusConfig['Finalizada'];
  const lastSession = formatDate(campaign.lastSessionAt);
  const nextSession = formatDate(campaign.nextSessionAt);

  return (
    <header className="mb-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors duration-150 mb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        aria-label="Volver a la lista de campañas"
      >
        <ArrowLeftIcon />
        Campañas
      </Link>

      {/* Title row */}
      <div className="flex items-start gap-3 mb-3">
        <h1
          id="campaign-heading"
          className="text-white text-3xl font-bold tracking-tight leading-tight flex-1"
        >
          {campaign.name}
        </h1>
        <Chip
          color={color}
          variant="flat"
          size="md"
          className="mt-1 shrink-0 font-medium"
        >
          {campaign.status}
        </Chip>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-zinc-400 text-base leading-relaxed mb-5 max-w-3xl">
          {campaign.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-5 border-t border-zinc-800 pt-4">
        {/* Sessions count */}
        <span className="flex items-center gap-2 text-zinc-400 text-sm">
          <BookIcon />
          <span>
            <span className="text-white font-semibold">{campaign.sessions}</span>{' '}
            {campaign.sessions === 1 ? 'sesión' : 'sesiones'}
          </span>
        </span>

        {/* Last session */}
        {lastSession && (
          <span className="flex items-center gap-2 text-zinc-400 text-sm">
            <CalendarIcon />
            <span>
              Última sesión:{' '}
              <span className="text-white font-medium">{lastSession}</span>
            </span>
          </span>
        )}

        {/* Next session */}
        {nextSession && (
          <span className="flex items-center gap-2 text-zinc-400 text-sm">
            <CalendarIcon />
            <span>
              Próxima sesión:{' '}
              <span className="text-white font-medium">{nextSession}</span>
            </span>
          </span>
        )}

        {/* Groups count */}
        {campaign.groups?.length > 0 && (
          <span className="text-zinc-400 text-sm">
            <span className="text-white font-semibold">{campaign.groups.length}</span>{' '}
            {campaign.groups.length === 1 ? 'grupo' : 'grupos'}
          </span>
        )}
      </div>
    </header>
  );
}
