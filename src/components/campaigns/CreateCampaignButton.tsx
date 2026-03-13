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
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { STATUS_OPTIONS } from '@/constants/domain';
import { apiPost } from '@/lib/api';

interface FormState {
  name: string;
  description: string;
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  status: 'Activa',
};

export function CreateCampaignButton() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

    if (!form.name.trim()) {
      setError('El nombre de la campaña es obligatorio.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPost('/api/campaign', {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      router.refresh();
      handleClose();
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
                  classNames={SELECT_CLASSES}
                  aria-label="Estado de la campaña"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>

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
