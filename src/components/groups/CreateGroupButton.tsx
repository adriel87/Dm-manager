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
import { fetchApi } from '@/lib/api';
import type { Character } from '@/components/characters/CharacterCard';

interface Campaign {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  description: string;
  memberIds: string[];
  campaignId: string | null;
}

interface FormError {
  message: string;
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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function CreateGroupButton({ campaigns }: CreateGroupButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<FormError | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Load characters when modal opens
  const handleOpen = async () => {
    onOpen();
    try {
      const chars = await fetchApi<Character[]>('/api/character');
      setCharacters(chars ?? []);
    } catch {
      // Silent - characters will be empty
    }
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
      setError({ message: 'El nombre del grupo es obligatorio.' });
      return;
    }

    startTransition(async () => {
      try {
        // Get full character objects from selected IDs
        const members = form.memberIds
          .map((id) => {
            const char = characters.find((c) => c.id === id);
            return char ? { id: char.id, name: char.name, classType: char.classType } : null;
          })
          .filter(Boolean) as { id: string; name: string; classType: string }[];

        const res = await fetch(`${BASE}/api/group`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            members,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError({
            message:
              (data as { message?: string }).message ??
              'Error al crear el grupo. Inténtalo de nuevo.',
          });
          return;
        }

        const createdGroup = await res.json();

        // If campaign selected, assign group to campaign
        if (form.campaignId) {
          const campaignRes = await fetch(`${BASE}/api/campaign/${form.campaignId}`);
          if (campaignRes.ok) {
            const campaign = await campaignRes.json();
            const currentGroups = campaign.groups ?? [];
            await fetch(`${BASE}/api/campaign/${form.campaignId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                groups: [...currentGroups, { id: createdGroup.id, name: createdGroup.name }],
              }),
            });
          }
        }

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
        classNames={{
          base: 'bg-zinc-900 border border-zinc-700',
          header: 'border-b border-zinc-800',
          body: 'py-5',
          footer: 'border-t border-zinc-800',
        }}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nuevo grupo
              </ModalHeader>

              <ModalBody className="gap-4">
                <Input
                  label="Nombre"
                  placeholder="El nombre de tu grupo"
                  value={form.name}
                  onValueChange={(val) => handleFieldChange('name', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={{
                    label: 'text-zinc-300',
                    input: 'text-white',
                    inputWrapper: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                  }}
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
                  classNames={{
                    label: 'text-zinc-300',
                    input: 'text-white',
                    inputWrapper: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                  }}
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
                  classNames={{
                    label: 'text-zinc-300',
                    trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                    popoverContent: 'bg-zinc-800 text-white',
                  }}
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
                  classNames={{
                    label: 'text-zinc-300',
                    value: 'text-white',
                    trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                    popoverContent: 'bg-zinc-800 text-white',
                  }}
                  aria-label="Campaña"
                  placeholder="Selecciona una campaña (opcional)"
                >
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id}>{campaign.name}</SelectItem>
                  ))}
                </Select>

                {error && (
                  <p role="alert" className="text-red-400 text-sm">
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
