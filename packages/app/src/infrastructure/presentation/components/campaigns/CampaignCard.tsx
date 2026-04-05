'use client';

import { Card, CardBody, CardHeader, CardFooter } from '@heroui/react';
import { Chip } from '@heroui/react';
import Link from 'next/link';
import { CalendarIcon, BookIcon } from '@/infrastructure/presentation/components/icons';
import { STATUS_COLOR } from '@/constants/ui';
import { formatDate } from '@/utils/formatDate';

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

/**
 * Pure Server Component — no interactivity needed.
 * The entire card is wrapped in a Next.js Link for full-area clickability.
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
  const color = STATUS_COLOR[campaign.status] ?? STATUS_COLOR['Finalizada'];
  const label = campaign.status;
  const nextSessionRaw = formatDate(campaign.nextSessionAt);
  const nextSession = nextSessionRaw === '—' ? null : nextSessionRaw;

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
            <BookIcon size={14} aria-hidden="true" />
            <span>
              {campaign.sessions}{' '}
              {campaign.sessions === 1 ? 'sesión' : 'sesiones'}
            </span>
          </span>

          {/* Next session date */}
          {nextSession && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <CalendarIcon size={14} aria-hidden="true" />
              <span>{nextSession}</span>
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
