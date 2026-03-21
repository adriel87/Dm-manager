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
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/constants/domain';
import { apiPost } from '@/lib/api';

interface CreateMissionButtonProps {
  campaignId: string;
  onCreated: () => void;
}

interface FormState {
  name: string;
  description: string;
  missionGuide: string;
  missionPriority: 'Alta' | 'Media' | 'Baja';
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  missionGuide: '',
  missionPriority: 'Media',
  status: 'Activa',
};

/**
 * Client Component island — renders a button that opens a modal form.
 * Calls `onCreated()` after a successful POST so the parent can refresh its list.
 */
export function CreateMissionButton({ campaignId, onCreated }: CreateMissionButtonProps) {
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

    if (!form.name.trim()) {
      setError('El nombre de la misión es obligatorio.');
      return;
    }
    if (!form.missionGuide.trim()) {
      setError('La guía de la misión es obligatoria.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPost(`/api/campaign/${campaignId}/missions`, {
        name: form.name.trim(),
        description: form.description.trim(),
        missionGuide: form.missionGuide.trim(),
        missionPriority: form.missionPriority,
        status: form.status,
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
        aria-label="Crear nueva misión"
      >
        + Nueva misión
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
                Nueva misión
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="Nombre de la misión"
                  value={form.name}
                  onValueChange={(val) => handleFieldChange('name', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre de la misión"
                />

                <Textarea
                  label="Descripción"
                  placeholder="Describe brevemente la misión..."
                  value={form.description}
                  onValueChange={(val) => handleFieldChange('description', val)}
                  isDisabled={isPending}
                  minRows={2}
                  maxRows={4}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción de la misión"
                />

                <Textarea
                  label="Guía de la misión"
                  placeholder="Instrucciones o guía para el DM..."
                  value={form.missionGuide}
                  onValueChange={(val) => handleFieldChange('missionGuide', val)}
                  isRequired
                  isDisabled={isPending}
                  minRows={3}
                  maxRows={6}
                  classNames={INPUT_CLASSES}
                  aria-label="Guía de la misión"
                />

                <div className="flex gap-3">
                  <Select
                    label="Prioridad"
                    selectedKeys={[form.missionPriority]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as FormState['missionPriority'];
                      if (selected) handleFieldChange('missionPriority', selected);
                    }}
                    isDisabled={isPending}
                    classNames={SELECT_CLASSES}
                    aria-label="Prioridad de la misión"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Estado"
                    selectedKeys={[form.status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as FormState['status'];
                      if (selected) handleFieldChange('status', selected);
                    }}
                    isDisabled={isPending}
                    classNames={SELECT_CLASSES}
                    aria-label="Estado de la misión"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>

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
                  {isPending ? 'Creando...' : 'Crear misión'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
