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
import { apiPost } from '@/lib/api';

interface CreateSessionButtonProps {
  campaignId: string;
  onCreated: () => void;
}

interface FormState {
  title: string;
  notes: string;
  date: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  notes: '',
  date: '',
};

/**
 * Client Component island — button that opens a modal to create a session.
 * The sessionNumber is auto-calculated by the backend.
 * Calls `onCreated()` after success so the parent can refresh the list.
 */
export function CreateSessionButton({ campaignId, onCreated }: CreateSessionButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setForm(EMPTY_FORM);
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
    if (!form.date) {
      setError('La fecha de la sesión es obligatoria.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPost(`/api/campaign/${campaignId}/sessions`, {
        title: form.title.trim(),
        notes: form.notes.trim(),
        date: form.date,
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
        aria-label="Crear nueva sesión"
      >
        + Nueva sesión
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
                Nueva sesión
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
                  isRequired
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
                  minRows={4}
                  maxRows={8}
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
                  {isPending ? 'Creando...' : 'Crear sesión'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
