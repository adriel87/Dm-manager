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
  Switch,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

type Age = 'child' | 'teenager' | 'adult' | 'elderly';
type ClassType =
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard'
  | 'Artificer'
  | 'Blood Hunter'
  | 'Normal'
  | 'Other';

const CLASS_OPTIONS: { key: ClassType; label: string }[] = [
  { key: 'Normal', label: 'Normal' },
  { key: 'Barbarian', label: 'Barbarian' },
  { key: 'Bard', label: 'Bard' },
  { key: 'Cleric', label: 'Cleric' },
  { key: 'Druid', label: 'Druid' },
  { key: 'Fighter', label: 'Fighter' },
  { key: 'Monk', label: 'Monk' },
  { key: 'Paladin', label: 'Paladin' },
  { key: 'Ranger', label: 'Ranger' },
  { key: 'Rogue', label: 'Rogue' },
  { key: 'Sorcerer', label: 'Sorcerer' },
  { key: 'Warlock', label: 'Warlock' },
  { key: 'Wizard', label: 'Wizard' },
  { key: 'Artificer', label: 'Artificer' },
  { key: 'Blood Hunter', label: 'Blood Hunter' },
  { key: 'Other', label: 'Other' },
];

const AGE_OPTIONS: { key: Age; label: string }[] = [
  { key: 'child', label: 'Niño' },
  { key: 'teenager', label: 'Joven' },
  { key: 'adult', label: 'Adulto' },
  { key: 'elderly', label: 'Anciano' },
];

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  classType: ClassType;
  level: string;
  hitPoints: string;
  age: Age;
  isNPC: boolean;
  description: string;
  location: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  classType: 'Normal',
  level: '1',
  hitPoints: '10',
  age: 'adult',
  isNPC: false,
  description: '',
  location: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateCharacterButton() {
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

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function validate(): string | null {
    if (!form.name.trim()) return 'El nombre del personaje es obligatorio.';
    const level = Number(form.level);
    if (!Number.isInteger(level) || level < 1) return 'El nivel debe ser un número entero mayor o igual a 1.';
    const hp = Number(form.hitPoints);
    if (!Number.isInteger(hp) || hp < 1) return 'Los puntos de vida deben ser un número entero mayor o igual a 1.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          name: form.name.trim(),
          classType: form.classType,
          level: Number(form.level),
          hitPoints: Number(form.hitPoints),
          age: form.age,
          isNPC: form.isNPC,
        };

        if (form.description.trim()) body.description = form.description.trim();
        if (form.location.trim()) body.location = form.location.trim();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/character`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}));
          setError(
            (data as { message?: string }).message ??
              'Error al crear el personaje. Inténtalo de nuevo.'
          );
          return;
        }

        router.refresh();
        handleClose();
      } catch {
        setError('Error de red. Verifica tu conexión e inténtalo de nuevo.');
      }
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
        aria-label="Crear nuevo personaje"
      >
        + Nuevo personaje
      </Button>

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

                {/* Class + Level — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Clase"
                    selectedKeys={[form.classType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as ClassType;
                      if (selected) setField('classType', selected);
                    }}
                    isDisabled={isPending}
                    classNames={{
                      label: 'text-zinc-300',
                      value: 'text-white',
                      trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                      popoverContent: 'bg-zinc-800 text-white',
                    }}
                    aria-label="Clase del personaje"
                  >
                    {CLASS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Nivel"
                    type="number"
                    min={1}
                    value={form.level}
                    onValueChange={(val) => setField('level', val)}
                    isDisabled={isPending}
                    classNames={INPUT_CLASSES}
                    aria-label="Nivel del personaje"
                  />
                </div>

                {/* HP + Age — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Puntos de vida (HP)"
                    type="number"
                    min={1}
                    value={form.hitPoints}
                    onValueChange={(val) => setField('hitPoints', val)}
                    isDisabled={isPending}
                    classNames={INPUT_CLASSES}
                    aria-label="Puntos de vida"
                  />

                  <Select
                    label="Edad"
                    selectedKeys={[form.age]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as Age;
                      if (selected) setField('age', selected);
                    }}
                    isDisabled={isPending}
                    classNames={{
                      label: 'text-zinc-300',
                      value: 'text-white',
                      trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
                      popoverContent: 'bg-zinc-800 text-white',
                    }}
                    aria-label="Edad del personaje"
                  >
                    {AGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* NPC toggle */}
                <div className="flex items-center justify-between rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3">
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">Es NPC</p>
                    <p className="text-zinc-500 text-xs">
                      Personaje no jugador controlado por el DM
                    </p>
                  </div>
                  <Switch
                    isSelected={form.isNPC}
                    onValueChange={(val) => setField('isNPC', val)}
                    isDisabled={isPending}
                    size="sm"
                    color="primary"
                    aria-label="Es NPC"
                  />
                </div>

                {/* Location */}
                <Input
                  label="Ubicación"
                  placeholder="Ciudad, región o punto de referencia"
                  value={form.location}
                  onValueChange={(val) => setField('location', val)}
                  isDisabled={isPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Ubicación del personaje"
                />

                {/* Description */}
                <Textarea
                  label="Descripción"
                  placeholder="Apariencia, personalidad, trasfondo..."
                  value={form.description}
                  onValueChange={(val) => setField('description', val)}
                  isDisabled={isPending}
                  minRows={3}
                  maxRows={6}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción del personaje"
                />

                {/* Error feedback */}
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
    </>
  );
}
