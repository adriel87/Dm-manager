'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { UserIcon } from '@/infrastructure/presentation/components/icons';

interface CharacterItem {
  id: string;
  name: string;
  classType: string;
  level: number;
  isNPC?: boolean;
}

interface AddExistingCharacterModalProps {
  campaignId: string;
  assignedCharacterIds: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Modal that fetches all characters in the system, filters out those already
 * assigned to the current campaign, and lets the DM pick one to assign.
 *
 * Includes a live name search (client-side filter, case-insensitive).
 */
export function AddExistingCharacterModal({
  campaignId,
  assignedCharacterIds,
  isOpen,
  onOpenChange,
  onAssigned,
}: AddExistingCharacterModalProps) {
  const [allCharacters, setAllCharacters] = useState<CharacterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch all characters when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadCharacters() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${BASE}/api/character`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CharacterItem[] = await res.json();
        setAllCharacters(Array.isArray(data) ? data : []);
      } catch {
        setLoadError('No se pudieron cargar los personajes.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCharacters();
  }, [isOpen]);

  function handleClose() {
    setSearchQuery('');
    setAssignError(null);
    onOpenChange(false);
  }

  // Characters not yet assigned to this campaign
  const unassigned = allCharacters.filter(
    (c) => !assignedCharacterIds.includes(c.id)
  );

  // Client-side search filter
  const filtered = searchQuery.trim()
    ? unassigned.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unassigned;

  function handleSelect(characterId: string) {
    setAssignError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `${BASE}/api/campaign/${campaignId}/characters`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setAssignError(data?.error ?? 'Error al asignar el personaje.');
          return;
        }

        onAssigned();
        handleClose();
      } catch {
        setAssignError('Error inesperado. Inténtalo de nuevo.');
      }
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      placement="center"
      size="md"
      scrollBehavior="inside"
      classNames={MODAL_CLASSES}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-white text-lg font-semibold">
              Añadir personaje existente
            </ModalHeader>

            <ModalBody className="gap-4 py-4">
              {/* Search input */}
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                isDisabled={isLoading || isPending}
                autoFocus
                classNames={INPUT_CLASSES}
                aria-label="Buscar personaje por nombre"
              />

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-zinc-400 text-sm">Cargando personajes...</p>
                </div>
              )}

              {/* Load error */}
              {loadError && (
                <p role="alert" className={ERROR_CLASSES}>
                  {loadError}
                </p>
              )}

              {/* No unassigned characters available */}
              {!isLoading && !loadError && unassigned.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                    <UserIcon size={18} className="text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">
                    No hay personajes disponibles para añadir
                  </p>
                  <p className="text-zinc-500 text-xs mt-1 max-w-xs">
                    Todos los personajes del sistema ya están asignados a esta campaña,
                    o no hay personajes creados aún.
                  </p>
                </div>
              )}

              {/* Search returned no results */}
              {!isLoading && !loadError && unassigned.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-zinc-400 text-sm">
                    No se encontraron personajes con ese nombre
                  </p>
                </div>
              )}

              {/* Character list */}
              {!isLoading && !loadError && filtered.length > 0 && (
                <ul
                  className="flex flex-col gap-2"
                  role="list"
                  aria-label="Personajes disponibles"
                >
                  {filtered.map((character) => (
                    <li key={character.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(character.id)}
                        disabled={isPending}
                        className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700/60 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Añadir personaje ${character.name}`}
                      >
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {character.name}
                          </p>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            {character.classType}
                            {' · '}
                            Nv. {character.level}
                            {' · '}
                            {character.isNPC ? 'NPC' : 'PJ'}
                          </p>
                        </div>
                        <span className="text-primary-400 text-xs shrink-0">
                          + Añadir
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Assign error */}
              {assignError && (
                <p role="alert" className={ERROR_CLASSES}>
                  {assignError}
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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
