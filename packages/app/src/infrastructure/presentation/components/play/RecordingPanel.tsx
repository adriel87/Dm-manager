'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { TranscriptionView } from './TranscriptionView';
import { MicIcon, RefreshIcon } from '@/infrastructure/presentation/components/icons';

// Local view types — mirror API response shape
interface TranscriptionSegmentView {
  speakerDiscordUserId: string;
  speakerLabel: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface SpeakerMappingView {
  discordUserId: string;
  discordUsername: string;
  characterId: string | null;
  characterName: string | null;
  label: string;
  role: 'player' | 'dm';
}

type RecordingStatus = 'recording' | 'processing' | 'transcribed' | 'failed';

interface RecordingView {
  id: string;
  status: RecordingStatus;
  durationSeconds: number | null;
  startedAt: string;
  speakers: SpeakerMappingView[];
  transcription: TranscriptionSegmentView[] | null;
  transcriptionError: string | null;
}

interface RecordingPanelProps {
  campaignId: string;
  sessionId: string;
  onRecordingUpdated: () => void;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}

type StatusChipColor = 'danger' | 'warning' | 'success' | 'default';

const STATUS_CHIP_CONFIG: Record<RecordingStatus, { label: string; color: StatusChipColor; pulse: boolean }> = {
  recording: { label: 'Grabando', color: 'danger', pulse: true },
  processing: { label: 'Procesando', color: 'warning', pulse: false },
  transcribed: { label: 'Transcrito', color: 'success', pulse: false },
  failed: { label: 'Error', color: 'danger', pulse: false },
};

/**
 * Toggleable panel in Play Mode — shows recordings for the current session.
 *
 * Fetches recordings on mount and allows triggering transcription or retry.
 * Clicking a transcribed recording expands the inline TranscriptionView.
 * Mirrors the CharacterPanel/NotesPanel layout: sticky header + scrollable list.
 */
export function RecordingPanel({ campaignId, sessionId, onRecordingUpdated }: RecordingPanelProps) {
  const [recordings, setRecordings] = useState<RecordingView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transcribePending, startTranscribeTransition] = useTransition();
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function fetchRecordings() {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `${BASE}/api/campaign/${campaignId}/recordings?sessionId=${sessionId}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRecordings(data ?? []);
    } catch {
      setFetchError('No se pudieron cargar las grabaciones.');
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, sessionId]);

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleTranscribe(recordingId: string) {
    setTranscribingId(recordingId);
    setActionError(null);
    startTranscribeTransition(async () => {
      try {
        const res = await fetch(
          `${BASE}/api/campaign/${campaignId}/recordings/${recordingId}/transcribe`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: 'es' }),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Error ${res.status}`);
        }
        await fetchRecordings();
        onRecordingUpdated();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Error al transcribir.');
      } finally {
        setTranscribingId(null);
      }
    });
  }

  return (
    <section
      className="flex flex-col h-full min-h-0"
      aria-labelledby="recording-panel-heading"
    >
      {/* ── Panel header ── */}
      <div className="sticky top-0 z-10 bg-zinc-900 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2
            id="recording-panel-heading"
            className="text-white text-base font-semibold"
          >
            Grabaciones
          </h2>
          {!isLoading && (
            <span className="text-zinc-500 text-sm">({recordings.length})</span>
          )}
        </div>

        <button
          onClick={fetchRecordings}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          aria-label="Actualizar lista de grabaciones"
          disabled={isLoading}
        >
          <RefreshIcon size={12} />
          Actualizar
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-zinc-500 text-sm">Cargando grabaciones...</p>
          </div>
        )}

        {!isLoading && fetchError && (
          <p role="alert" className="text-danger-400 text-sm bg-danger-50/10 border border-danger-200/20 rounded-lg px-3 py-2">
            {fetchError}
          </p>
        )}

        {!isLoading && !fetchError && recordings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <MicIcon size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">
              Sin grabaciones en esta sesión
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              Las grabaciones aparecen aquí cuando el bot de Discord las registra.
            </p>
          </div>
        )}

        {!isLoading && !fetchError && recordings.length > 0 && (
          <>
            {actionError && (
              <p role="alert" className="text-danger-400 text-sm bg-danger-50/10 border border-danger-200/20 rounded-lg px-3 py-2 mb-3">
                {actionError}
              </p>
            )}
            <ul
              className="flex flex-col gap-3"
              role="list"
              aria-label="Lista de grabaciones de la sesión"
            >
              {recordings.map((rec) => {
                const chipConfig = STATUS_CHIP_CONFIG[rec.status] ?? STATUS_CHIP_CONFIG.failed;
                const isExpanded = expandedId === rec.id;
                const isThisTranscribing = transcribePending && transcribingId === rec.id;

                return (
                  <li key={rec.id}>
                    <Card
                      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
                      shadow="none"
                    >
                      <CardBody className="py-3 px-4">
                        {/* Recording meta row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={chipConfig.color}
                                className="text-xs shrink-0"
                                startContent={
                                  chipConfig.pulse ? (
                                    <span
                                      className="inline-block w-1.5 h-1.5 rounded-full bg-danger-400 animate-pulse"
                                      aria-hidden="true"
                                    />
                                  ) : undefined
                                }
                              >
                                {chipConfig.label}
                              </Chip>
                              {rec.durationSeconds !== null && (
                                <span className="text-zinc-500 text-xs">
                                  {formatDuration(rec.durationSeconds)}
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-500 text-xs mt-1">{formatDate(rec.startedAt)}</p>
                            {rec.speakers.length > 0 && (
                              <p className="text-zinc-600 text-xs mt-0.5">
                                {rec.speakers.length} speaker{rec.speakers.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {rec.status === 'processing' && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                isLoading={isThisTranscribing}
                                isDisabled={transcribePending}
                                onPress={() => handleTranscribe(rec.id)}
                                className="text-xs font-medium"
                                aria-label={`Transcribir grabación del ${formatDate(rec.startedAt)}`}
                              >
                                {isThisTranscribing ? 'Transcribiendo...' : 'Transcribir'}
                              </Button>
                            )}
                            {rec.status === 'failed' && (
                              <Button
                                size="sm"
                                color="warning"
                                variant="flat"
                                isLoading={isThisTranscribing}
                                isDisabled={transcribePending}
                                onPress={() => handleTranscribe(rec.id)}
                                className="text-xs font-medium"
                                aria-label={`Reintentar transcripción de grabación del ${formatDate(rec.startedAt)}`}
                              >
                                Reintentar
                              </Button>
                            )}
                            {rec.status === 'transcribed' && rec.transcription && (
                              <button
                                onClick={() => handleToggleExpand(rec.id)}
                                className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2 py-1"
                                aria-label={isExpanded ? 'Ocultar transcripción' : 'Ver transcripción'}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? 'Ocultar' : 'Ver transcripción'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Error message for failed recordings */}
                        {rec.status === 'failed' && rec.transcriptionError && (
                          <p className="text-danger-400 text-xs mt-1 bg-danger-50/10 rounded px-2 py-1">
                            {rec.transcriptionError}
                          </p>
                        )}

                        {/* Inline transcription view */}
                        {isExpanded && rec.transcription && (
                          <div className="mt-3 pt-3 border-t border-zinc-700">
                            <TranscriptionView
                              segments={rec.transcription}
                              speakers={rec.speakers}
                            />
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
