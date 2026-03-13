'use client';

import Link from 'next/link';
import { Chip } from '@heroui/react';
import type { Campaign } from '@/components/campaigns/CampaignCard';
import { BookIcon, CalendarIcon, ArrowLeftIcon } from '@/components/icons';
import { STATUS_COLOR } from '@/constants/ui';
import { formatDate } from '@/utils/formatDate';

interface CampaignDetailHeaderProps {
  campaign: Campaign;
}

/**
 * Server Component — static campaign header.
 * Shows navigation breadcrumb, title, status, description, and stat row.
 */
export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const color = STATUS_COLOR[campaign.status] ?? STATUS_COLOR['Finalizada'];
  const lastSessionRaw = formatDate(campaign.lastSessionAt);
  const nextSessionRaw = formatDate(campaign.nextSessionAt);
  const lastSession = lastSessionRaw === '—' ? null : lastSessionRaw;
  const nextSession = nextSessionRaw === '—' ? null : nextSessionRaw;

  return (
    <header className="mb-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors duration-150 mb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        aria-label="Volver a la lista de campañas"
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
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
          <BookIcon size={15} aria-hidden="true" />
          <span>
            <span className="text-white font-semibold">{campaign.sessions}</span>{' '}
            {campaign.sessions === 1 ? 'sesión' : 'sesiones'}
          </span>
        </span>

        {/* Last session */}
        {lastSession && (
          <span className="flex items-center gap-2 text-zinc-400 text-sm">
            <CalendarIcon size={15} aria-hidden="true" />
            <span>
              Última sesión:{' '}
              <span className="text-white font-medium">{lastSession}</span>
            </span>
          </span>
        )}

        {/* Next session */}
        {nextSession && (
          <span className="flex items-center gap-2 text-zinc-400 text-sm">
            <CalendarIcon size={15} aria-hidden="true" />
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
