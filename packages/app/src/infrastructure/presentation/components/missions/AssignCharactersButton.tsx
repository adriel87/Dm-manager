'use client';

import { useState, useTransition } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  CheckboxGroup,
  useDisclosure,
} from '@heroui/react';
import { MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { apiPut, apiGet } from '@/lib/api';
import type { Character } from '@/domain/character/character';
import type { Mission } from '@/domain/mission/mission';

interface AssignCharactersButtonProps {
  mission: Pick<Mission, 'id' | 'relatedCharacters'>;
  onAssigned: () => void;
}

export function AssignCharactersButton({ mission, onAssigned }: AssignCharactersButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [characters, setCharacters] = useState<Pick<Character, 'id' | 'name'>[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function handleOpen() {
    if (!loaded) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiGet<Pick<Character, 'id' | 'name'>[]>('/api/character');
        if (data) {
          setCharacters(data);
          const currentIds = (mission.relatedCharacters ?? []).map((c) => c.id);
          setSelectedIds(currentIds);
        } else {
          setError('Error al cargar los personajes.');
        }
      } catch {
        setError('Error de red. Verifica tu conexión.');
      } finally {
        setIsLoading(false);
        setLoaded(true);
      }
    }
    onOpen();
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const assignedCharacters = characters
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({ id: c.id, name: c.name }));

    startTransition(async () => {
      const { error: apiError } = await apiPut(`/api/mission/${mission.id}`, {
        relatedCharacters: assignedCharacters,
        name: '',
        description: '',
        missionGuide: '',
        missionPriority: '',
        status: 'Activa',
        missionEvents: null,
        rewards: null,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      onAssigned();
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
        aria-label="Asignar personajes"
      >
        Asignar personajes
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        placement="center"
        size="md"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Asignar personajes a la misión
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                {isLoading ? (
                  <p className="text-zinc-400 text-sm">Cargando personajes...</p>
                ) : characters.length === 0 ? (
                  <p className="text-zinc-400 text-sm">
                    No hay personajes disponibles.
                  </p>
                ) : (
                  <CheckboxGroup
                    value={selectedIds}
                    onValueChange={setSelectedIds}
                    orientation="vertical"
                    classNames={{
                      wrapper: 'gap-2',
                    }}
                  >
                    {characters.map((character) => (
                      <Checkbox
                        key={character.id}
                        value={character.id}
                        classNames={{
                          label: 'text-zinc-300',
                        }}
                      >
                        {character.name}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                )}

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
                  isDisabled={isPending || isLoading}
                  className="font-medium"
                >
                  {isPending ? 'Guardando...' : 'Guardar asignaciones'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
