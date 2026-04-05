'use client';

import { SessionNotesEditor } from './SessionNotesEditor';
import { SessionHistoryItem } from './SessionHistoryItem';
import { EditIcon } from '@/infrastructure/presentation/components/icons';

interface EmbeddedSession {
  id: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface SessionPanelProps {
  campaignId: string;
  sessions: EmbeddedSession[];
  onSessionUpdated: () => void;
  onNotesChange: (hasChanges: boolean) => void;
}

/**
 * Right panel of Play Mode — session management for live gameplay.
 *
 * Structure:
 * 1. Header with session count
 * 2. Current session notes editor (most recent session, if exists)
 * 3. Previous sessions history list (read + edit)
 *
 * Session creation is handled via the PlayModeActionMenu (hamburger menu).
 * The onNotesChange callback propagates dirty state up to PlayModeView
 * so the unsaved changes warning (useBeforeUnload) can be activated.
 */
export function SessionPanel({
  campaignId,
  sessions,
  onSessionUpdated,
  onNotesChange,
}: SessionPanelProps) {
  // Sessions sorted descending — most recent first
  const sortedSessions = [...sessions].sort(
    (a, b) => b.sessionNumber - a.sessionNumber
  );

  const currentSession = sortedSessions[0] ?? null;
  const historySessions = sortedSessions.slice(1);

  return (
    <section
      className="flex flex-col h-full min-h-0"
      aria-labelledby="sessions-panel-heading"
    >
      {/* ── Panel header ── */}
      <div className="sticky top-0 z-10 bg-zinc-900 pb-4 flex items-center gap-2">
        <h2
          id="sessions-panel-heading"
          className="text-white text-base font-semibold"
        >
          Sesiones
        </h2>
        <span className="text-zinc-500 text-sm">({sessions.length})</span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">

        {/* Current session editor */}
        {currentSession ? (
          <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
              Sesión actual
            </p>
            <SessionNotesEditor
              key={currentSession.id}
              campaignId={campaignId}
              session={currentSession}
              onSaved={onSessionUpdated}
              onDirtyChange={onNotesChange}
            />
          </div>
        ) : (
          /* No sessions yet */
          <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <EditIcon size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">
              Aún no hay sesiones registradas
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              Usa el menú de acciones para registrar la primera sesión jugada.
            </p>
          </div>
        )}

        {/* Session history */}
        {historySessions.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
              Sesiones anteriores
            </p>
            <ul className="flex flex-col gap-2" role="list" aria-label="Historial de sesiones">
              {historySessions.map((session) => (
                <li key={session.id}>
                  <SessionHistoryItem
                    campaignId={campaignId}
                    session={session}
                    onUpdated={onSessionUpdated}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
