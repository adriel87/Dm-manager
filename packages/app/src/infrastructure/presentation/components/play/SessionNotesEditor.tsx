'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button, Textarea } from '@heroui/react';
import { INPUT_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { apiPut } from '@/lib/api';

interface EmbeddedSession {
  id: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface SessionNotesEditorProps {
  campaignId: string;
  session: EmbeddedSession;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

/**
 * Inline textarea editor for session notes.
 * Tracks dirty state and notifies parent for unsaved changes warning.
 * Uses PUT to update the session via the campaign aggregate API.
 */
export function SessionNotesEditor({
  campaignId,
  session,
  onSaved,
  onDirtyChange,
}: SessionNotesEditorProps) {
  const [notes, setNotes] = useState(session.notes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track dirty state
  const isDirty = notes !== session.notes;

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  async function handleSave() {
    if (!isDirty) return;

    startTransition(async () => {
      const { error: apiError } = await apiPut(
        `/api/campaign/${campaignId}/sessions/${session.id}`,
        {
          id: session.id,
          title: session.title,
          notes: notes,
          sessionNumber: session.sessionNumber,
          date: session.date,
        }
      );

      if (apiError) {
        setError(apiError);
        return;
      }

      setError(null);
      onSaved();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white text-sm font-medium">
          Sesión #{session.sessionNumber}: {session.title}
        </h4>
        {isDirty && (
          <span className="text-warning-400 text-xs">Sin guardar</span>
        )}
      </div>

      <Textarea
        aria-label="Notas de la sesión"
        value={notes}
        onValueChange={(val) => {
          setNotes(val);
          if (error) setError(null);
        }}
        placeholder="Escribe notas durante la sesión..."
        minRows={6}
        maxRows={20}
        isDisabled={isPending}
        classNames={INPUT_CLASSES}
      />

      {error && (
        <p role="alert" className={ERROR_CLASSES}>
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          onPress={handleSave}
          color="primary"
          size="sm"
          isLoading={isPending}
          isDisabled={!isDirty || isPending}
          className="font-medium"
        >
          {isPending ? 'Guardando...' : 'Guardar notas'}
        </Button>
      </div>
    </div>
  );
}
