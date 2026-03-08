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

interface CreateSessionButtonProps {
  campaignId: string;
  onCreated: () => void;
}

interface FormState {
  title: string;
  notes: string;
  sessionNumber: string;
  date: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  notes: '',
  sessionNumber: '',
  date: '',
};

/**
 * Client Component island — button that opens a modal to create a session.
 * Includes the `campaignId` in the POST body automatically.
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
    const sessionNum = parseInt(form.sessionNumber, 10);
    if (isNaN(sessionNum) || sessionNum < 1) {
      setError('El número de sesión debe ser un número positivo.');
      return;
    }
    if (!form.date) {
      setError('La fecha de la sesión es obligatoria.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/session`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              title: form.title.trim(),
              notes: form.notes.trim(),
              sessionNumber: sessionNum,
              date: form.date,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            (data as { message?: string }).message ??
              'Error al crear la sesión. Inténtalo de nuevo.'
          );
          return;
        }

        onCreated();
        handleClose();
      } catch {
        setError('Error de red. Verifica tu conexión e inténtalo de nuevo.');
      }
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

                <div className="flex gap-3">
                  <Input
                    label="Número de sesión"
                    placeholder="Ej: 3"
                    type="number"
                    min={1}
                    value={form.sessionNumber}
                    onValueChange={(val) => handleFieldChange('sessionNumber', val)}
                    isRequired
                    isDisabled={isPending}
                    classNames={INPUT_CLASSES}
                    aria-label="Número de sesión"
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
                </div>

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
