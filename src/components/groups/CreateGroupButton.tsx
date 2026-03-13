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
import { fetchApi, apiPost, apiPut } from '@/lib/api';
import type { Character } from '@/domain/character/character';
import type { Group } from '@/domain/group/group';

interface Campaign {
  id: string;
  name: string;
  groups?: Pick<Group, 'id' | 'name'>[];
}

interface FormState {
  name: string;
  description: string;
  memberIds: string[];
  campaignId: string | null;
}

interface CreateGroupButtonProps {
  campaigns: Campaign[];
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  memberIds: [],
  campaignId: null,
};

export function CreateGroupButton({ campaigns }: CreateGroupButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [characters, setCharacters] = useState<Pick<Character, 'id' | 'name' | 'classType'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpen = async () => {
    onOpen();
    const chars = await fetchApi<Pick<Character, 'id' | 'name' | 'classType'>[]>('/api/character');
    setCharacters(chars ?? []);
  };

  function handleClose() {
    setForm(EMPTY_FORM);
    setError(null);
    setCharacters([]);
    onClose();
  }

  function handleFieldChange(field: keyof FormState, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('El nombre del grupo es obligatorio.');
      return;
    }

    startTransition(async () => {
      const members = form.memberIds
        .map((id) => {
          const char = characters.find((c) => c.id === id);
          return char ? { id: char.id, name: char.name, classType: char.classType } : null;
        })
        .filter(Boolean) as { id: string; name: string; classType: string }[];

      const { data: createdGroup, error: createError } = await apiPost<Group>('/api/group', {
        name: form.name.trim(),
        description: form.description.trim(),
        members,
      });

      if (createError || !createdGroup) {
        setError(createError ?? 'Error al crear el grupo. Inténtalo de nuevo.');
        return;
      }

      // If campaign selected, assign group to campaign
      if (form.campaignId) {
        const campaign = await fetchApi<Campaign>(`/api/campaign/${form.campaignId}`);
        if (campaign) {
          const currentGroups = campaign.groups ?? [];
          await apiPut(`/api/campaign/${form.campaignId}`, {
            groups: [...currentGroups, { id: createdGroup.id, name: createdGroup.name }],
          });
        }
      }

      router.refresh();
      handleClose();
    });
  }

  return (
    <>
      <Button
        onPress={handleOpen}
        color="primary"
        variant="solid"
        size="md"
        className="font-medium"
        aria-label="Crear nuevo grupo"
      >
        + Nuevo grupo
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
                Nuevo grupo
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="El nombre de tu grupo"
                  value={form.name}
                  onValueChange={(val) => handleFieldChange('name', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre del grupo"
                />

                <Textarea
                  label="Descripción"
                  placeholder="Una breve descripción del grupo..."
                  value={form.description}
                  onValueChange={(val) => handleFieldChange('description', val)}
                  isDisabled={isPending}
                  minRows={2}
                  maxRows={4}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción del grupo"
                />

                <Select
                  label="Miembros"
                  placeholder="Selecciona los miembros"
                  selectionMode="multiple"
                  selectedKeys={form.memberIds}
                  onSelectionChange={(keys) => {
                    const selected = keys ? Array.from(keys).map(String) : [];
                    handleFieldChange('memberIds', selected);
                  }}
                  isDisabled={isPending}
                  aria-label="Miembros del grupo"
                  classNames={SELECT_CLASSES}
                >
                  {characters.map((char) => (
                    <SelectItem key={char.id} textValue={char.name}>
                      {char.name}
                      <span className="text-zinc-500 ml-1">({char.classType})</span>
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Asignar a campaña"
                  selectedKeys={form.campaignId ? [form.campaignId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string | undefined;
                    handleFieldChange('campaignId', selected ?? '');
                  }}
                  isDisabled={isPending}
                  classNames={SELECT_CLASSES}
                  aria-label="Campaña"
                  placeholder="Selecciona una campaña (opcional)"
                >
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id}>{campaign.name}</SelectItem>
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
                  {isPending ? 'Creando...' : 'Crear grupo'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
