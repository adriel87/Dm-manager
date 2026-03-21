'use client';

import { Card, CardBody, Button } from '@heroui/react';
import { NOTE_BORDER_COLOR } from '@/constants/ui';
import type { NoteColorKey } from '@/constants/ui';
import { XIcon } from '@/infrastructure/presentation/components/icons';
import { formatDate } from '@/utils/formatDate';

export interface Note {
  id: string;
  comment: string;
  color: NoteColorKey;
  createdAt: string;
}

interface NoteItemProps {
  campaignId: string;
  note: Note;
  onDeleted?: () => void;
}

/**
 * Note card with colored left border and delete action.
 * Lightweight display — no edit capability (sticky-note metaphor).
 */
export function NoteItem({ campaignId, note, onDeleted }: NoteItemProps) {
  const borderClass = NOTE_BORDER_COLOR[note.color] ?? NOTE_BORDER_COLOR.yellow;
  const formattedDate = formatDate(note.createdAt);

  async function handleDelete() {
    try {
      const res = await fetch(
        `/api/campaign/${campaignId}/notes/${note.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al eliminar nota');
      onDeleted?.();
    } catch {
      // Silent — user can retry
    }
  }

  return (
    <Card
      className={`bg-zinc-800 border border-zinc-700 border-l-4 ${borderClass} hover:border-zinc-600 transition-colors duration-200`}
      shadow="none"
    >
      <CardBody className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-zinc-300 text-sm leading-relaxed flex-1 whitespace-pre-wrap">
            {note.comment}
          </p>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleDelete}
            className="text-zinc-500 hover:text-danger-400 shrink-0 -mt-1 -mr-1"
            aria-label="Eliminar nota"
          >
            <XIcon size={14} />
          </Button>
        </div>
        {formattedDate !== '—' && (
          <p className="text-zinc-500 text-xs mt-2">{formattedDate}</p>
        )}
      </CardBody>
    </Card>
  );
}
