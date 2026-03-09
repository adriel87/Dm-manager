'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';

interface FormState {
  name: string;
  description: string;
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

interface FormError {
  message: string;
}

const STATUS_OPTIONS = [
  { key: 'Activa', label: 'Activa' },
  { key: 'Pausada', label: 'Pausada' },
  { key: 'Finalizada', label: 'Finalizada' },
] as const;

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  status: 'Activa',
};

export function CreateCampaignButton() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<FormError | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClose() {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  }

  function handleFieldChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on any change so the user gets fresh feedback
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError({ message: 'El nombre de la campaña es obligatorio.' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/campaign`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name.trim(),
              description: form.description.trim(),
              status: form.status,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError({
            message:
              (data as { message?: string }).message ??
              'Error al crear la campaña. Inténtalo de nuevo.',
          });
          return;
        }

        // Refresh the Server Component tree to show the new campaign
        router.refresh();
        handleClose();
      } catch {
        setError({
          message: 'Error de red. Verifica tu conexión e inténtalo de nuevo.',
        });
      }
    });
  }

  return (
    <>
      <Button
        onPress={onOpen}
        color="primary"
        variant="solid"
        size="md"
        className="font-medium"
        aria-label="Crear nueva campaña"
      >
        + Nueva campaña
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
                Nueva campaña
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="El nombre de tu campaña"
                  value={form.name}
                  onValueChange={(val) => handleFieldChange('name', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre de la campaña"
                />

                <Textarea
                  label="Descripción"
                  placeholder="Una breve descripción de la campaña..."
                  value={form.description}
                  onValueChange={(val) => handleFieldChange('description', val)}
                  isDisabled={isPending}
                  minRows={3}
                  maxRows={6}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción de la campaña"
                />

                <Select
                  label="Estado"
                  selectedKeys={[form.status]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as FormState['status'];
                    if (selected) handleFieldChange('status', selected);
                  }}
                  isDisabled={isPending}
                  classNames={{
                    label: 'text-zinc-300',
                    value: 'text-white',
                    trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                    popoverContent: 'bg-zinc-800 text-white',
                  }}
                  aria-label="Estado de la campaña"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Error feedback */}
                {error && (
                  <p role="alert" className={ERROR_CLASSES}>
                    {error.message}
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
                  {isPending ? 'Creando...' : 'Crear campaña'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
