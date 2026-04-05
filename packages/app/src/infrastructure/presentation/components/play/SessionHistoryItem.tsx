'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { formatDate } from '@/utils/formatDate';
import { EditSessionButton } from './EditSessionButton';
import { ChevronDownIcon } from '@/infrastructure/presentation/components/icons';

interface EmbeddedSession {
  id: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface SessionHistoryItemProps {
  campaignId: string;
  session: EmbeddedSession;
  onUpdated: () => void;
}

/**
 * Collapsible session card for the history list.
 * Shows session summary when collapsed, full notes when expanded.
 * Includes EditSessionButton for modifying past sessions.
 */
export function SessionHistoryItem({
  campaignId,
  session,
  onUpdated,
}: SessionHistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDateRaw = formatDate(session.date);
  const formattedDate = formattedDateRaw === '—' ? null : formattedDateRaw;

  return (
    <Card
      className="bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader
        className="flex items-start justify-between gap-3 pb-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Sesión ${session.sessionNumber}: ${session.title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-0.5">
            Sesión #{session.sessionNumber}
          </p>
          <h4 className="text-zinc-300 font-medium text-sm leading-snug line-clamp-1">
            {session.title || 'Sin título'}
          </h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {formattedDate && (
            <span className="text-zinc-500 text-xs">{formattedDate}</span>
          )}
          <ChevronDownIcon
            size={16}
            className={`text-zinc-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardBody className="pt-2 border-t border-zinc-700/50 animate-in slide-in-from-top-1 duration-200">
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap mb-3">
            {session.notes || 'Sin notas para esta sesión.'}
          </p>
          <div className="flex justify-end">
            <EditSessionButton
              campaignId={campaignId}
              session={session}
              onUpdated={onUpdated}
            />
          </div>
        </CardBody>
      )}
    </Card>
  );
}
