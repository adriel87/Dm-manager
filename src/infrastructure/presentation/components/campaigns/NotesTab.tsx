'use client';

import { useState, useCallback } from 'react';
import { Tab } from '@heroui/react';
import { NoteItem, type Note } from '@/infrastructure/presentation/components/campaigns/NoteItem';
import { CreateNoteButton } from '@/infrastructure/presentation/components/campaigns/CreateNoteButton';
import { InfoCircleIcon } from '@/infrastructure/presentation/components/icons';

interface NotesTabProps {
  campaignId: string;
  initialNotes: Note[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function NotesTab({ campaignId, initialNotes }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/campaign/${campaignId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const sorted = (data.notes ?? []).sort(
        (a: Note, b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotes(sorted);
    } catch {
      // Silent — list keeps stale data; user can retry via next action
    }
  }, [campaignId]);

  return (
    
      <section aria-labelledby="notes-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="notes-heading" className="text-white text-lg font-semibold">
            Notas
            <span className="text-zinc-500 text-sm font-normal ml-2">({notes.length})</span>
          </h2>
          <CreateNoteButton campaignId={campaignId} onCreated={refresh} />
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <InfoCircleIcon size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-white text-base font-semibold mb-1">Sin notas todavía</h3>
            <p className="text-zinc-400 text-sm max-w-xs">
              Pulsa &quot;+ Nueva nota&quot; para agregar la primera nota a esta campaña.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3" role="list" aria-label="Lista de notas">
            {notes.map((note) => (
              <li key={note.id}>
                <NoteItem campaignId={campaignId} note={note} onDeleted={refresh} />
              </li>
            ))}
          </ul>
        )}
      </section>
  );
}
