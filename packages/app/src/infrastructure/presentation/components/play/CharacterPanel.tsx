'use client';

import { useDisclosure } from '@heroui/react';
import { Chip } from '@heroui/react';
import { UserIcon, PlusIcon } from '@/infrastructure/presentation/components/icons';
import { CreateCharacterInPlayModal } from './CreateCharacterInPlayModal';
import { AddExistingCharacterModal } from './AddExistingCharacterModal';
import type { CharacterRef } from '@/domain/campaign/campaign';

interface CharacterPanelProps {
  campaignId: string;
  characters: CharacterRef[];
  onCharacterAdded: () => void;
}

/**
 * Third panel in Play Mode — shows characters assigned to the campaign.
 *
 * Includes a "+ Personaje" button with two sub-options:
 * - "Crear desde cero" → CreateCharacterInPlayModal
 * - "Seleccionar existente" → AddExistingCharacterModal
 *
 * Layout mirrors MissionPanel: sticky header + scrollable list.
 */
export function CharacterPanel({
  campaignId,
  characters,
  onCharacterAdded,
}: CharacterPanelProps) {
  const createModal = useDisclosure();
  const addExistingModal = useDisclosure();

  const assignedIds = characters.map((c) => c.id);

  return (
    <section
      className="flex flex-col h-full min-h-0"
      aria-labelledby="characters-panel-heading"
    >
      {/* ── Panel header ── */}
      <div className="sticky top-0 z-10 bg-zinc-900 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2
            id="characters-panel-heading"
            className="text-white text-base font-semibold"
          >
            Personajes
          </h2>
          <span className="text-zinc-500 text-sm">({characters.length})</span>
        </div>

        {/* Add character dropdown */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={createModal.onOpen}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2 py-1 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20"
            aria-label="Crear personaje desde cero"
          >
            <PlusIcon size={12} />
            Crear
          </button>
          <button
            onClick={addExistingModal.onOpen}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            aria-label="Añadir personaje existente a la campaña"
          >
            <PlusIcon size={12} />
            Añadir
          </button>
        </div>
      </div>

      {/* ── Character list ── */}
      <div className="flex-1 overflow-y-auto pr-1">
        {characters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <UserIcon size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">
              No hay personajes en esta campaña
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              Usa &quot;Crear&quot; para crear uno nuevo o &quot;Añadir&quot; para asignar uno existente.
            </p>
          </div>
        )}

        {characters.length > 0 && (
          <ul
            className="flex flex-col gap-2"
            role="list"
            aria-label="Lista de personajes de la campaña"
          >
            {characters.map((character) => (
              <li key={character.id}>
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {character.name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {character.classType}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    className="text-xs shrink-0 text-zinc-400"
                  >
                    Nv. {character.level}
                  </Chip>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Modals ── */}
      <CreateCharacterInPlayModal
        campaignId={campaignId}
        isOpen={createModal.isOpen}
        onOpenChange={createModal.onOpenChange}
        onCreated={onCharacterAdded}
      />

      <AddExistingCharacterModal
        campaignId={campaignId}
        assignedCharacterIds={assignedIds}
        isOpen={addExistingModal.isOpen}
        onOpenChange={addExistingModal.onOpenChange}
        onAssigned={onCharacterAdded}
      />
    </section>
  );
}
