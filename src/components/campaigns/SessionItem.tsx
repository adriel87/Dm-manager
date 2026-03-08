'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { formatDate } from '@/utils/formatDate';

export interface Session {
  id: string;
  campaignId: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface SessionItemProps {
  session: Session;
}

/**
 * Pure Server Component — displays a single session card.
 * Shows session number, title, date, and a notes preview.
 */
export function SessionItem({ session }: SessionItemProps) {
  const formattedDateRaw = formatDate(session.date);
  const formattedDate = formattedDateRaw === '—' ? null : formattedDateRaw;

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-1">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-0.5">
            Sesión #{session.sessionNumber}
          </p>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
            {session.title || 'Sin título'}
          </h3>
        </div>
        {formattedDate && (
          <span className="text-zinc-500 text-xs shrink-0 mt-0.5">{formattedDate}</span>
        )}
      </CardHeader>

      <CardBody className="pt-1">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
          {session.notes || 'Sin notas para esta sesión.'}
        </p>
      </CardBody>
    </Card>
  );
}
