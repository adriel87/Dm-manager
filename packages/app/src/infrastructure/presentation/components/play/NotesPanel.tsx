'use client';

import { NoteItem, type Note } from '@/infrastructure/presentation/components/campaigns/NoteItem';
import { FileTextIcon } from '@/infrastructure/presentation/components/icons';

interface NotesPanelProps {
  campaignId: string;
  notes: Note[];
  onNoteDeleted: () => void;
}

/**
 * Toggleable panel in Play Mode — shows campaign notes.
 *
 * Mirrors the CharacterPanel pattern: sticky header + scrollable list.
 * Notes are created via the PlayModeActionMenu (hamburger menu).
 * Deletion is handled inline by each NoteItem.
 */
export function NotesPanel({
  campaignId,
  notes,
  onNoteDeleted,
}: NotesPanelProps) {
  // Sort notes by createdAt descending (most recent first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section
      className="flex flex-col h-full min-h-0"
      aria-labelledby="notes-panel-heading"
    >
      {/* ── Panel header ── */}
      <div className="sticky top-0 z-10 bg-zinc-900 pb-4 flex items-center gap-2">
        <h2
          id="notes-panel-heading"
          className="text-white text-base font-semibold"
        >
          Notas
        </h2>
        <span className="text-zinc-500 text-sm">({notes.length})</span>
      </div>

      {/* ── Notes list ── */}
      <div className="flex-1 overflow-y-auto pr-1">
        {sortedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <FileTextIcon size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">
              No hay notas en esta campaña
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              Usa el menú de acciones para crear la primera nota.
            </p>
          </div>
        )}

        {sortedNotes.length > 0 && (
          <ul
            className="flex flex-col gap-2"
            role="list"
            aria-label="Lista de notas de la campaña"
          >
            {sortedNotes.map((note) => (
              <li key={note.id}>
                <NoteItem
                  campaignId={campaignId}
                  note={note}
                  onDeleted={onNoteDeleted}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
