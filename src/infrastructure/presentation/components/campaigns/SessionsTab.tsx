'use client';

import { useState, useCallback } from 'react';
import { Tab } from '@heroui/react';
import { SessionItem, type Session } from '@/infrastructure/presentation/components/campaigns/SessionItem';
import { CreateSessionButton } from '@/infrastructure/presentation/components/campaigns/CreateSessionButton';
import { InfoCircleIcon } from '@/infrastructure/presentation/components/icons';
import { EmbeddedSession } from '@/domain/campaign/campaign';
import { apiGet } from '@/lib/api';

interface SessionsTabProps {
  campaignId: string;
  initialSessions: EmbeddedSession[];
}

export function SessionsTab({ campaignId, initialSessions }: SessionsTabProps) {
  const [sessions, setSessions] = useState<EmbeddedSession[]>(initialSessions);

  const refresh = useCallback(async () => {
    const data = await apiGet<{ sessions: EmbeddedSession[] }>(`/api/campaign/${campaignId}`);
    if (!data) return;
    setSessions((data.sessions ?? []).sort((a, b) => b.sessionNumber - a.sessionNumber));
  }, [campaignId]);

  return (
    
      <section aria-labelledby="sessions-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="sessions-heading" className="text-white text-lg font-semibold">
            Sesiones
            <span className="text-zinc-500 text-sm font-normal ml-2">({sessions.length})</span>
          </h2>
          <CreateSessionButton campaignId={campaignId} onCreated={refresh} />
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <InfoCircleIcon size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-white text-base font-semibold mb-1">Sin sesiones todavía</h3>
            <p className="text-zinc-400 text-sm max-w-xs">
              Pulsa &quot;+ Nueva sesión&quot; para registrar la primera sesión jugada.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3" role="list" aria-label="Lista de sesiones">
            {sessions.map((session) => (
              <li key={session.id}>
                <SessionItem session={session} />
              </li>
            ))}
          </ul>
        )}
      </section>
  );
}
