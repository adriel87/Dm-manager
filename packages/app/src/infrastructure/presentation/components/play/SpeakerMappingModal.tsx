'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { PlusIcon, XIcon } from '@/infrastructure/presentation/components/icons';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const DM_DISCORD_ID = process.env.NEXT_PUBLIC_DM_DISCORD_USER_ID ?? '';
const DM_DISCORD_USERNAME = process.env.NEXT_PUBLIC_DM_DISCORD_USERNAME || 'DM';

export interface SpeakerPreset {
  discordUserId: string;
  discordUsername: string; // playerAlias ?? playerName ?? name
  characterId: string;
  characterName: string;
}

// Local view types
interface SpeakerRowView {
  discordUserId: string;
  discordUsername: string;
  characterId: string | null;
  role: 'player' | 'dm';
}

interface SpeakerMappingModalProps {
  campaignId: string;
  characters: { id: string; name: string; classType: string; level: number }[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaved: () => void;
  speakerPresets?: SpeakerPreset[];
}

const EMPTY_ROW = (): SpeakerRowView => ({
  discordUserId: '',
  discordUsername: '',
  characterId: null,
  role: 'player',
});

/**
 * Modal to configure Discord user → character speaker mappings for the campaign.
 *
 * Fetches existing mappings on open, allows adding/removing/editing rows,
 * and saves the full array via PUT.
 */
export function SpeakerMappingModal({
  campaignId,
  characters,
  isOpen,
  onOpenChange,
  onSaved,
  speakerPresets,
}: SpeakerMappingModalProps) {
  const [rows, setRows] = useState<SpeakerRowView[]>([EMPTY_ROW()]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch existing mappings whenever the modal opens, then apply presets additively
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingMappings(true);
    setError(null);
    fetch(`${BASE}/api/campaign/${campaignId}/speaker-mappings`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        let mappings: SpeakerRowView[] = Array.isArray(data) ? data : [];

        // Auto-populate from character speakerIds (additive — don't overwrite existing)
        const existingIds = new Set(mappings.map((m) => m.discordUserId));
        const newRows = (speakerPresets ?? [])
          .filter((p) => p.discordUserId && !existingIds.has(p.discordUserId))
          .map((p) => ({
            discordUserId: p.discordUserId,
            discordUsername: p.discordUsername,
            characterId: p.characterId,
            role: 'player' as const,
          }));
        mappings = [...mappings, ...newRows];

        // Auto-add DM row from env var (additive)
        if (DM_DISCORD_ID && !mappings.some((m) => m.discordUserId === DM_DISCORD_ID)) {
          mappings = [
            ...mappings,
            { discordUserId: DM_DISCORD_ID, discordUsername: DM_DISCORD_USERNAME, characterId: null, role: 'dm' as const },
          ];
        }

        setRows(mappings.length > 0 ? mappings : [EMPTY_ROW()]);
      })
      .catch(() => {
        setError('No se pudieron cargar los mappings actuales.');
        setRows([EMPTY_ROW()]);
      })
      .finally(() => setIsLoadingMappings(false));
  }, [isOpen, campaignId, speakerPresets]);

  function handleClose() {
    setError(null);
    onOpenChange(false);
  }

  function addRow() {
    setRows((prev) => [...prev, EMPTY_ROW()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow<K extends keyof SpeakerRowView>(index: number, field: K, value: SpeakerRowView[K]) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    if (error) setError(null);
  }

  async function handleSave() {
    // Validate: every row must have userId and username
    const invalid = rows.some((r) => !r.discordUserId.trim() || !r.discordUsername.trim());
    if (invalid) {
      setError('Todos los speakers necesitan un ID y nombre de usuario de Discord.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `${BASE}/api/campaign/${campaignId}/speaker-mappings`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rows),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Error ${res.status}`);
        }
        onSaved();
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar los mappings.');
      }
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      placement="center"
      size="xl"
      classNames={MODAL_CLASSES}
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-white text-lg font-semibold">
              Speaker Mapping
            </ModalHeader>

            <ModalBody className="gap-4 py-5">
              <p className="text-zinc-400 text-sm">
                Asigna cada usuario de Discord a un personaje de la campaña para atribuir correctamente la transcripción.
              </p>

              {isLoadingMappings && (
                <p className="text-zinc-500 text-sm text-center py-4">
                  Cargando mappings...
                </p>
              )}

              {!isLoadingMappings && (
                <div className="flex flex-col gap-4">
                  {rows.map((row, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-4 rounded-lg bg-zinc-800 border border-zinc-700"
                    >
                      {/* Row header */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-xs font-medium">
                          Speaker {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-zinc-500 hover:text-danger-400 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-0.5"
                          aria-label={`Eliminar speaker ${index + 1}`}
                          disabled={isPending}
                        >
                          <XIcon size={14} />
                        </button>
                      </div>

                      {/* Discord fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Nombre de usuario de Discord"
                          placeholder="@username"
                          value={row.discordUsername}
                          onValueChange={(val) => updateRow(index, 'discordUsername', val)}
                          isDisabled={isPending}
                          classNames={INPUT_CLASSES}
                          aria-label="Nombre de usuario de Discord"
                        />
                        <Input
                          label="ID de usuario de Discord"
                          placeholder="123456789012345678"
                          value={row.discordUserId}
                          onValueChange={(val) => updateRow(index, 'discordUserId', val)}
                          isDisabled={isPending}
                          classNames={INPUT_CLASSES}
                          aria-label="ID de usuario de Discord"
                        />
                      </div>

                      {/* Character + role */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                          label="Personaje"
                          selectedKeys={row.characterId ? [row.characterId] : ['__none__']}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            updateRow(index, 'characterId', selected === '__none__' ? null : selected);
                          }}
                          isDisabled={isPending}
                          classNames={SELECT_CLASSES}
                          aria-label="Personaje asignado"
                        >
                          <>
                            <SelectItem key="__none__">DM / Sin personaje</SelectItem>
                            {characters.map((c) => (
                              <SelectItem key={c.id}>
                                {c.name} — {c.classType} Nv.{c.level}
                              </SelectItem>
                            ))}
                          </>
                        </Select>

                        {/* Role toggle */}
                        <div>
                          <p className="text-zinc-300 text-sm mb-2">Rol</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateRow(index, 'role', 'player')}
                              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                                row.role === 'player'
                                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                                  : 'bg-zinc-700 border-zinc-600 text-zinc-400 hover:text-white'
                              }`}
                              aria-label={`Rol jugador para speaker ${index + 1}`}
                              aria-pressed={row.role === 'player'}
                              disabled={isPending}
                            >
                              Jugador
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRow(index, 'role', 'dm')}
                              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                                row.role === 'dm'
                                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                                  : 'bg-zinc-700 border-zinc-600 text-zinc-400 hover:text-white'
                              }`}
                              aria-label={`Rol DM para speaker ${index + 1}`}
                              aria-pressed={row.role === 'dm'}
                              disabled={isPending}
                            >
                              DM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add row button */}
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors duration-150 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label="Agregar speaker"
                    disabled={isPending}
                  >
                    <PlusIcon size={14} />
                    Agregar speaker
                  </button>
                </div>
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
                type="button"
                color="primary"
                isLoading={isPending}
                isDisabled={isPending || isLoadingMappings}
                onPress={handleSave}
                className="font-medium"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
