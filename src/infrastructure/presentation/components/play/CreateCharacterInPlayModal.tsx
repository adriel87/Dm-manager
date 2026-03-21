'use client';

import { useState, useTransition } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { DnDClassEnum, AgeTypeEnum } from '@/domain/character/character';
import type { DnDClassType, AgeType } from '@/domain/character/character';

interface CreateCharacterInPlayModalProps {
  campaignId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface CharacterFormState {
  name: string;
  classType: DnDClassType;
  age: AgeType;
  level: number;
  hitPoints: number;
  isNPC: boolean;
  playerName: string;
  description: string;
}

const EMPTY_FORM: CharacterFormState = {
  name: '',
  classType: 'Normal',
  age: 'adult',
  level: 1,
  hitPoints: 10,
  isNPC: false,
  playerName: '',
  description: '',
};

// Build Select options from enums
const CLASS_OPTIONS = Object.entries(DnDClassEnum).map(([key, label]) => ({
  key,
  label,
}));

const AGE_OPTIONS: { key: AgeType; label: string }[] = [
  { key: 'child', label: 'Niño/a' },
  { key: 'teenager', label: 'Adolescente' },
  { key: 'adult', label: 'Adulto/a' },
  { key: 'elderly', label: 'Anciano/a' },
];

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Modal form to create a new Character from scratch and immediately
 * assign it to the campaign. Used from Play Mode.
 *
 * Two-step submit:
 * 1. POST /api/character  → creates the Character entity
 * 2. POST /api/campaign/[id]/characters  → assigns CharacterRef to campaign
 */
export function CreateCharacterInPlayModal({
  campaignId,
  isOpen,
  onOpenChange,
  onCreated,
}: CreateCharacterInPlayModalProps) {
  const [form, setForm] = useState<CharacterFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setForm(EMPTY_FORM);
    setError(null);
    onOpenChange(false);
  }

  function setField<K extends keyof CharacterFormState>(
    field: K,
    value: CharacterFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('El nombre del personaje es obligatorio.');
      return;
    }
    if (form.level < 1) {
      setError('El nivel debe ser 1 o superior.');
      return;
    }
    if (form.hitPoints < 1) {
      setError('Los puntos de vida deben ser 1 o superiores.');
      return;
    }

    startTransition(async () => {
      try {
        // Step 1: Create the character
        const createRes = await fetch(`${BASE}/api/character`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            classType: form.classType,
            age: form.age,
            level: form.level,
            hitPoints: form.hitPoints,
            isNPC: form.isNPC,
            playerName: form.isNPC ? undefined : form.playerName.trim() || undefined,
            description: form.description.trim() || undefined,
            createdAt: new Date().toISOString(),
          }),
        });

        if (!createRes.ok) {
          const data = await createRes.json().catch(() => ({}));
          setError(data?.error ?? 'Error al crear el personaje.');
          return;
        }

        const newCharacter = await createRes.json();

        // Step 2: Assign to campaign
        const assignRes = await fetch(
          `${BASE}/api/campaign/${campaignId}/characters`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: newCharacter.id }),
          }
        );

        if (!assignRes.ok) {
          const data = await assignRes.json().catch(() => ({}));
          setError(data?.error ?? 'Error al asignar el personaje a la campaña.');
          return;
        }

        onCreated();
        handleClose();
      } catch {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      placement="center"
      size="lg"
      scrollBehavior="inside"
      classNames={MODAL_CLASSES}
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSubmit} noValidate>
            <ModalHeader className="text-white text-lg font-semibold">
              Nuevo personaje
            </ModalHeader>

            <ModalBody className="gap-4 py-5">
              {/* Name */}
              <Input
                label="Nombre"
                placeholder="Nombre del personaje"
                value={form.name}
                onValueChange={(val) => setField('name', val)}
                isRequired
                isDisabled={isPending}
                autoFocus
                classNames={INPUT_CLASSES}
                aria-label="Nombre del personaje"
              />

              {/* Class + Age row */}
              <div className="flex gap-3">
                <Select
                  label="Clase"
                  selectedKeys={[form.classType]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as DnDClassType;
                    if (val) setField('classType', val);
                  }}
                  isDisabled={isPending}
                  classNames={SELECT_CLASSES}
                  aria-label="Clase del personaje"
                >
                  {CLASS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Edad"
                  selectedKeys={[form.age]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as AgeType;
                    if (val) setField('age', val);
                  }}
                  isDisabled={isPending}
                  classNames={SELECT_CLASSES}
                  aria-label="Edad del personaje"
                >
                  {AGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {/* Level + HP row */}
              <div className="flex gap-3">
                <Input
                  label="Nivel"
                  type="number"
                  value={String(form.level)}
                  onValueChange={(val) => setField('level', Math.max(1, parseInt(val) || 1))}
                  isDisabled={isPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Nivel del personaje"
                  min={1}
                />
                <Input
                  label="Puntos de vida"
                  type="number"
                  value={String(form.hitPoints)}
                  onValueChange={(val) => setField('hitPoints', Math.max(1, parseInt(val) || 1))}
                  isDisabled={isPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Puntos de vida del personaje"
                  min={1}
                />
              </div>

              {/* NPC toggle */}
              <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3 border border-zinc-700">
                <div>
                  <p className="text-zinc-300 text-sm font-medium">Personaje no jugador (NPC)</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {form.isNPC ? 'Controlado por el DM' : 'Controlado por un jugador'}
                  </p>
                </div>
                <Switch
                  isSelected={form.isNPC}
                  onValueChange={(val) => setField('isNPC', val)}
                  isDisabled={isPending}
                  size="sm"
                  aria-label="Es NPC"
                />
              </div>

              {/* Player name — only when not NPC */}
              {!form.isNPC && (
                <Input
                  label="Nombre del jugador"
                  placeholder="Nombre real del jugador"
                  value={form.playerName}
                  onValueChange={(val) => setField('playerName', val)}
                  isDisabled={isPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre del jugador"
                />
              )}

              {/* Description */}
              <Textarea
                label="Descripción"
                placeholder="Apariencia, personalidad, trasfondo..."
                value={form.description}
                onValueChange={(val) => setField('description', val)}
                isDisabled={isPending}
                minRows={2}
                maxRows={4}
                classNames={INPUT_CLASSES}
                aria-label="Descripción del personaje"
              />

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
                {isPending ? 'Creando...' : 'Crear personaje'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
