'use client';

import { useState, useTransition } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { apiPut } from '@/lib/api';

interface EmbeddedSession {
  id: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: string;
}

interface EditSessionButtonProps {
  campaignId: string;
  session: EmbeddedSession;
  onUpdated: () => void;
}

interface FormState {
  title: string;
  notes: string;
  date: string;
}

function formFromSession(session: EmbeddedSession): FormState {
  return {
    title: session.title,
    notes: session.notes,
    // Normalise date to YYYY-MM-DD for the date input
    date: session.date ? session.date.toString().slice(0, 10) : '',
  };
}

/**
 * Client Component island — button that opens a modal to edit an existing session.
 * sessionNumber is intentionally NOT editable (auto-calculated, immutable).
 * Pattern follows EditMissionButton exactly.
 */
export function EditSessionButton({
  campaignId,
  session,
  onUpdated,
}: EditSessionButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(formFromSession(session));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setForm(formFromSession(session));
    setError(null);
    onOpen();
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleFieldChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('El título de la sesión es obligatorio.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPut(
        `/api/campaign/${campaignId}/sessions/${session.id}`,
        {
          id: session.id,
          title: form.title.trim(),
          notes: form.notes.trim(),
          sessionNumber: session.sessionNumber,
          date: form.date,
        }
      );

      if (apiError) {
        setError(apiError);
        return;
      }

      onUpdated();
      handleClose();
    });
  }

  return (
    <>
      <Button
        onPress={handleOpen}
        variant="flat"
        size="sm"
        className="text-zinc-400 hover:text-white"
        aria-label={`Editar sesión ${session.sessionNumber}: ${session.title}`}
      >
        Editar
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
                Editar sesión #{session.sessionNumber}
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Título"
                  placeholder="Ej: El castillo oscuro"
                  value={form.title}
                  onValueChange={(val) => handleFieldChange('title', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Título de la sesión"
                />

                <Input
                  label="Fecha"
                  type="date"
                  value={form.date}
                  onValueChange={(val) => handleFieldChange('date', val)}
                  isDisabled={isPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Fecha de la sesión"
                />

                <Textarea
                  label="Notas"
                  placeholder="Resumen de lo ocurrido en la sesión..."
                  value={form.notes}
                  onValueChange={(val) => handleFieldChange('notes', val)}
                  isDisabled={isPending}
                  minRows={5}
                  maxRows={12}
                  classNames={INPUT_CLASSES}
                  aria-label="Notas de la sesión"
                />

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
                  {isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
