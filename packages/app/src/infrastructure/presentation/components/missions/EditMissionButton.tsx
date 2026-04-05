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
import { apiPut } from '@/lib/api';
import type { Mission } from '@/domain/mission/mission';

type MissionFields = Pick<Mission, 'id' | 'name' | 'description' | 'missionGuide' | 'missionPriority' | 'status'>;

interface EditMissionButtonProps {
  campaignId: string;
  mission: MissionFields;
  onUpdated: () => void;
}

interface FormState {
  name: string;
  description: string;
  missionGuide: string;
  missionPriority: 'Alta' | 'Media' | 'Baja';
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

function formFromMission(mission: MissionFields): FormState {
  return {
    name: mission.name,
    description: mission.description,
    missionGuide: mission.missionGuide,
    missionPriority: (mission.missionPriority as FormState['missionPriority']) || 'Media',
    status: mission.status as FormState['status'],
  };
}

export function EditMissionButton({ campaignId, mission, onUpdated }: EditMissionButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(formFromMission(mission));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setForm(formFromMission(mission));
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

    if (!form.name.trim()) {
      setError('El nombre de la misión es obligatorio.');
      return;
    }
    if (!form.missionGuide.trim()) {
      setError('La guía de la misión es obligatoria.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPut(`/api/campaign/${campaignId}/missions/${mission.id}`, {
        id: mission.id,
        name: form.name.trim(),
        description: form.description.trim(),
        missionGuide: form.missionGuide.trim(),
        missionPriority: form.missionPriority,
        status: form.status,
        missionEvents: null,
        rewards: null,
        relatedCharacters: null,
      });

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
        aria-label="Editar misión"
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
                Editar misión
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
