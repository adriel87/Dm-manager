'use client';

import { useState, useTransition } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, NOTE_SWATCH_BG } from '@/constants/ui';
import type { NoteColorKey } from '@/constants/ui';
import { VALID_NOTE_COLORS } from '@/domain/campaign/campaign';
import { apiPost } from '@/lib/api';

interface CreateNoteButtonProps {
  campaignId: string;
  onCreated: () => void;
}

interface FormState {
  comment: string;
  color: NoteColorKey;
}

const EMPTY_FORM: FormState = {
  comment: '',
  color: 'yellow',
};

/** Human-readable labels for note color swatches. */
const COLOR_LABELS: Record<NoteColorKey, string> = {
  yellow: 'Amarillo',
  blue: 'Azul',
  green: 'Verde',
  red: 'Rojo',
  purple: 'Morado',
  gray: 'Gris',
};

/**
 * Client Component island — button that opens a modal to create a note.
 * Calls `onCreated()` after a successful POST so the parent can refresh the list.
 */
export function CreateNoteButton({ campaignId, onCreated }: CreateNoteButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  }

  function handleFieldChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.comment.trim()) {
      setError('El comentario de la nota es obligatorio.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPost(`/api/campaign/${campaignId}/notes`, {
        comment: form.comment.trim(),
        color: form.color,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      onCreated();
      handleClose();
    });
  }

  return (
    <>
      <Button
        onPress={onOpen}
        color="primary"
        variant="solid"
        size="sm"
        className="font-medium"
        aria-label="Crear nueva nota"
      >
        + Nueva nota
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        placement="center"
        size="lg"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nueva nota
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Textarea
                  label="Comentario"
                  placeholder="Escribe tu nota..."
                  value={form.comment}
                  onValueChange={(val) => handleFieldChange('comment', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  minRows={3}
                  maxRows={8}
                  classNames={INPUT_CLASSES}
                  aria-label="Comentario de la nota"
                />

                {/* Color picker — swatches */}
                <fieldset>
                  <legend className="text-zinc-300 text-sm mb-2">Color</legend>
                  <div className="flex items-center gap-2" role="radiogroup" aria-label="Color de la nota">
                    {VALID_NOTE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleFieldChange('color', color as NoteColorKey)}
                        disabled={isPending}
                        className={`w-7 h-7 rounded-full ${NOTE_SWATCH_BG[color as NoteColorKey]} transition-all duration-150 ${
                          form.color === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        role="radio"
                        aria-checked={form.color === color}
                        aria-label={COLOR_LABELS[color as NoteColorKey]}
                      />
                    ))}
                  </div>
                </fieldset>

                {error && (
                  <p role="alert" className={ERROR_CLASSES}>
                    {error}
                  </p>
                )}
              </ModalBody>

              <ModalFooter className="gap-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleClose}
                  isDisabled={isPending}
                  className="text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isPending}
                  isDisabled={isPending}
                  className="font-medium"
                >
                  {isPending ? 'Creando...' : 'Crear nota'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
