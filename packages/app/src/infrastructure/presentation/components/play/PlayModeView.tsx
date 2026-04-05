'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@heroui/react';
import { MissionPanel } from './MissionPanel';
import { SessionPanel } from './SessionPanel';
import { CharacterPanel } from './CharacterPanel';
import { NotesPanel } from './NotesPanel';
import { RecordingPanel } from './RecordingPanel';
import { SpeakerMappingModal, type SpeakerPreset } from './SpeakerMappingModal';
import { PlayModeActionMenu } from './PlayModeActionMenu';
import { useBeforeUnload } from './useBeforeUnload';
import { ChevronLeftIcon, DotFilledIcon, UsersIcon, FileTextIcon, MicIcon } from '@/infrastructure/presentation/components/icons';
import type { CharacterRef } from '@/domain/campaign/campaign';
import type { Note } from '@/infrastructure/presentation/components/campaigns/NoteItem';

type MissionStatusType = 'Activa' | 'Pausada' | 'Finalizada';

interface MissionEvent {
  name: string;
  difficult: string;
}

interface EmbeddedMission {
  id: string;
  name: string;
  description: string;
  missionGuide: string;
  missionEvents: MissionEvent[] | null;
  missionPriority: string;
  status: MissionStatusType;
  relatedCharacters: { id: string; name: string }[] | null;
  rewards?: string | null;
  startDate?: string;
  endDate?: string;
}

interface EmbeddedSession {
  id: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface PlayModeViewProps {
  campaignId: string;
  campaignName: string;
  missions: EmbeddedMission[];
  sessions: EmbeddedSession[];
  characters: CharacterRef[];
  notes: Note[];
  speakerPresets?: SpeakerPreset[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchCampaign(campaignId: string): Promise<{
  missions: EmbeddedMission[];
  sessions: EmbeddedSession[];
  characters: CharacterRef[];
  notes: Note[];
} | null> {
  try {
    const res = await fetch(`${BASE}/api/campaign/${campaignId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Main Client Component island for Play Mode.
 *
 * Owns all state for the play session:
 * - missions[], sessions[], characters[], notes[] (local, updated on mutation)
 * - expandedMissionId — which mission card is currently open
 * - hasUnsavedNotes — tracks unsaved session notes for beforeunload warning
 * - showCharacterPanel / showNotesPanel — toggle extra columns on desktop
 *
 * Layout: CSS Grid responsive to panel toggles:
 * - 0 extra panels → grid-cols-1 lg:grid-cols-2
 * - 1 extra panel  → grid-cols-1 lg:grid-cols-3
 * - 2 extra panels → grid-cols-1 lg:grid-cols-4
 */
export function PlayModeView({
  campaignId,
  campaignName,
  missions: initialMissions,
  sessions: initialSessions,
  characters: initialCharacters,
  notes: initialNotes,
  speakerPresets,
}: PlayModeViewProps) {
  const router = useRouter();
  const [missions, setMissions] = useState<EmbeddedMission[]>(initialMissions);
  const [sessions, setSessions] = useState<EmbeddedSession[]>(initialSessions);
  const [characters, setCharacters] = useState<CharacterRef[]>(initialCharacters);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);
  const [showCharacterPanel, setShowCharacterPanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showRecordingPanel, setShowRecordingPanel] = useState(false);
  const speakerMappingModal = useDisclosure();

  // Block navigation if there are unsaved session notes
  useBeforeUnload(hasUnsavedNotes);

  // Number of extra panels visible (for grid column calculation)
  const extraPanels =
    (showCharacterPanel ? 1 : 0) + (showNotesPanel ? 1 : 0) + (showRecordingPanel ? 1 : 0);

  // Re-fetch full campaign aggregate and update local state
  const refreshData = useCallback(async () => {
    const data = await fetchCampaign(campaignId);
    if (data) {
      setMissions(data.missions ?? []);
      setSessions(data.sessions ?? []);
      setCharacters(data.characters ?? []);
      setNotes(data.notes ?? []);
    }
  }, [campaignId]);

  // Toggle expand/collapse of a mission card (single-select)
  function handleToggleExpand(missionId: string) {
    setExpandedMissionId((prev) => (prev === missionId ? null : missionId));
  }

  // Update mission status optimistically in local state after API success
  function handleMissionStatusChange(missionId: string, newStatus: MissionStatusType) {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
    );
  }

  // After session created: refresh all data and reset unsaved state
  async function handleSessionCreated() {
    setHasUnsavedNotes(false);
    await refreshData();
  }

  // After session updated: refresh all data
  async function handleSessionUpdated() {
    setHasUnsavedNotes(false);
    await refreshData();
  }

  // After character added (created or assigned): refresh all data
  async function handleCharacterAdded() {
    await refreshData();
  }

  const assignedCharacterIds = characters.map((c) => c.id);

  return (
    <div className="flex flex-col h-full">
      {/* ── Play Mode Header ── */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            className="text-zinc-500 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            aria-label="Volver al detalle de la campaña"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">
              Modo Juego
            </p>
            <h1 className="text-white text-lg font-semibold leading-tight">
              {campaignName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedNotes && (
            <span className="text-warning-400 text-xs flex items-center gap-1.5">
              <DotFilledIcon size={12} />
              Notas sin guardar
            </span>
          )}

          {/* Character panel toggle */}
          <button
            onClick={() => setShowCharacterPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              showCharacterPanel
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
            aria-label={showCharacterPanel ? 'Ocultar panel de personajes' : 'Mostrar panel de personajes'}
            aria-pressed={showCharacterPanel}
          >
            <UsersIcon size={14} />
            <span className="hidden sm:inline">Personajes</span>
          </button>

          {/* Notes panel toggle */}
          <button
            onClick={() => setShowNotesPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              showNotesPanel
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
            aria-label={showNotesPanel ? 'Ocultar panel de notas' : 'Mostrar panel de notas'}
            aria-pressed={showNotesPanel}
          >
            <FileTextIcon size={14} />
            <span className="hidden sm:inline">Notas</span>
          </button>

          {/* Recording panel toggle */}
          <button
            onClick={() => setShowRecordingPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              showRecordingPanel
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
            aria-label={showRecordingPanel ? 'Ocultar panel de grabaciones' : 'Mostrar panel de grabaciones'}
            aria-pressed={showRecordingPanel}
          >
            <MicIcon size={14} />
            <span className="hidden sm:inline">Grabaciones</span>
          </button>

          {/* Hamburger action menu */}
          <PlayModeActionMenu
            campaignId={campaignId}
            assignedCharacterIds={assignedCharacterIds}
            onSessionCreated={handleSessionCreated}
            onMissionCreated={refreshData}
            onCharacterAdded={handleCharacterAdded}
            onNoteCreated={refreshData}
            onSpeakerMappingOpen={speakerMappingModal.onOpen}
          />
        </div>
      </header>

      {/* ── Panel Grid ── */}
      <div
        className={`grid gap-6 flex-1 min-h-0 grid-cols-1 ${
          extraPanels === 0 ? 'lg:grid-cols-2' :
          extraPanels === 1 ? 'lg:grid-cols-3' :
          extraPanels === 2 ? 'lg:grid-cols-4' :
          'lg:grid-cols-5'
        }`}
      >
        <MissionPanel
          campaignId={campaignId}
          missions={missions}
          expandedMissionId={expandedMissionId}
          onToggleExpand={handleToggleExpand}
          onStatusChange={handleMissionStatusChange}
        />

        <SessionPanel
          campaignId={campaignId}
          sessions={sessions}
          onSessionUpdated={handleSessionUpdated}
          onNotesChange={setHasUnsavedNotes}
        />

        {showCharacterPanel && (
          <CharacterPanel
            campaignId={campaignId}
            characters={characters}
            onCharacterAdded={handleCharacterAdded}
          />
        )}

        {showNotesPanel && (
          <NotesPanel
            campaignId={campaignId}
            notes={notes}
            onNoteDeleted={refreshData}
          />
        )}

        {showRecordingPanel && (
          <RecordingPanel
            campaignId={campaignId}
            sessionId={sessions[sessions.length - 1]?.id ?? ''}
            onRecordingUpdated={refreshData}
          />
        )}
      </div>

      {/* ── Speaker Mapping Modal ── */}
      <SpeakerMappingModal
        campaignId={campaignId}
        characters={characters.map((c) => ({
          id: c.id,
          name: c.name,
          classType: c.classType,
          level: c.level,
        }))}
        isOpen={speakerMappingModal.isOpen}
        onOpenChange={speakerMappingModal.onOpenChange}
        onSaved={refreshData}
        speakerPresets={speakerPresets}
      />
    </div>
  );
}
