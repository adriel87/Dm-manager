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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES, NOTE_SWATCH_BG } from '@/constants/ui';
import type { NoteColorKey } from '@/constants/ui';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, NOTE_COLOR_OPTIONS } from '@/constants/domain';
import { MenuIcon, CalendarIcon, FileTextIcon, UserIcon, EditIcon } from '@/infrastructure/presentation/components/icons';
import { CreateCharacterInPlayModal } from './CreateCharacterInPlayModal';
import { AddExistingCharacterModal } from './AddExistingCharacterModal';
import { apiPost } from '@/lib/api';

interface PlayModeActionMenuProps {
  campaignId: string;
  assignedCharacterIds: string[];
  onSessionCreated: () => void;
  onMissionCreated: () => void;
  onCharacterAdded: () => void;
  onNoteCreated: () => void;
}

// ─── Session form ─────────────────────────────────────────────────────────────

interface SessionFormState {
  title: string;
  notes: string;
  date: string;
}

const EMPTY_SESSION: SessionFormState = { title: '', notes: '', date: '' };

// ─── Mission form ─────────────────────────────────────────────────────────────

interface MissionFormState {
  name: string;
  description: string;
  missionGuide: string;
  missionPriority: 'Alta' | 'Media' | 'Baja';
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

const EMPTY_MISSION: MissionFormState = {
  name: '',
  description: '',
  missionGuide: '',
  missionPriority: 'Media',
  status: 'Activa',
};

// ─── Note form ──────────────────────────────────────────────────────────────

interface NoteFormState {
  comment: string;
  color: NoteColorKey;
}

const EMPTY_NOTE: NoteFormState = { comment: '', color: 'yellow' };

/**
 * Hamburger menu (☰) in the Play Mode header.
 *
 * Contains 4 actions:
 * 1. + Nueva sesión  → session creation modal
 * 2. + Nueva misión  → mission creation modal
 * 3. + Nueva nota    → note creation modal
 * 4. + Personaje     → sub-dropdown: "Crear desde cero" | "Seleccionar existente"
 *
 * Each action owns its modal state (useDisclosure) so that selecting an item
 * from the dropdown opens the correct modal.
 *
 * The session, mission, and note modal logic is inlined here (mirrors the
 * existing Create* button patterns) so we don't need to modify external components.
 */
export function PlayModeActionMenu({
  campaignId,
  assignedCharacterIds,
  onSessionCreated,
  onMissionCreated,
  onCharacterAdded,
  onNoteCreated,
}: PlayModeActionMenuProps) {
  // Session modal
  const sessionModal = useDisclosure();
  const [sessionForm, setSessionForm] = useState<SessionFormState>(EMPTY_SESSION);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionPending, startSessionTransition] = useTransition();

  // Mission modal
  const missionModal = useDisclosure();
  const [missionForm, setMissionForm] = useState<MissionFormState>(EMPTY_MISSION);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [missionPending, startMissionTransition] = useTransition();

  // Note modal
  const noteModal = useDisclosure();
  const [noteForm, setNoteForm] = useState<NoteFormState>(EMPTY_NOTE);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [notePending, startNoteTransition] = useTransition();

  // Character modals
  const createCharModal = useDisclosure();
  const addExistingModal = useDisclosure();

  // ── Session handlers ──────────────────────────────────────────────────────

  function handleSessionClose() {
    setSessionForm(EMPTY_SESSION);
    setSessionError(null);
    sessionModal.onClose();
  }

  function setSessionField<K extends keyof SessionFormState>(
    field: K,
    value: SessionFormState[K]
  ) {
    setSessionForm((prev) => ({ ...prev, [field]: value }));
    if (sessionError) setSessionError(null);
  }

  async function handleSessionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sessionForm.title.trim()) {
      setSessionError('El título de la sesión es obligatorio.');
      return;
    }
    if (!sessionForm.date) {
      setSessionError('La fecha de la sesión es obligatoria.');
      return;
    }
    startSessionTransition(async () => {
      const { error: apiError } = await apiPost(
        `/api/campaign/${campaignId}/sessions`,
        {
          title: sessionForm.title.trim(),
          notes: sessionForm.notes.trim(),
          date: sessionForm.date,
        }
      );
      if (apiError) { setSessionError(apiError); return; }
      onSessionCreated();
      handleSessionClose();
    });
  }

  // ── Mission handlers ──────────────────────────────────────────────────────

  function handleMissionClose() {
    setMissionForm(EMPTY_MISSION);
    setMissionError(null);
    missionModal.onClose();
  }

  function setMissionField<K extends keyof MissionFormState>(
    field: K,
    value: MissionFormState[K]
  ) {
    setMissionForm((prev) => ({ ...prev, [field]: value }));
    if (missionError) setMissionError(null);
  }

  async function handleMissionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!missionForm.name.trim()) {
      setMissionError('El nombre de la misión es obligatorio.');
      return;
    }
    if (!missionForm.missionGuide.trim()) {
      setMissionError('La guía de la misión es obligatoria.');
      return;
    }
    startMissionTransition(async () => {
      const { error: apiError } = await apiPost(
        `/api/campaign/${campaignId}/missions`,
        {
          name: missionForm.name.trim(),
          description: missionForm.description.trim(),
          missionGuide: missionForm.missionGuide.trim(),
          missionPriority: missionForm.missionPriority,
          status: missionForm.status,
        }
      );
      if (apiError) { setMissionError(apiError); return; }
      onMissionCreated();
      handleMissionClose();
    });
  }

  // ── Note handlers ────────────────────────────────────────────────────────

  function handleNoteClose() {
    setNoteForm(EMPTY_NOTE);
    setNoteError(null);
    noteModal.onClose();
  }

  async function handleNoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!noteForm.comment.trim()) {
      setNoteError('El comentario es obligatorio.');
      return;
    }
    startNoteTransition(async () => {
      const { error: apiError } = await apiPost(
        `/api/campaign/${campaignId}/notes`,
        {
          comment: noteForm.comment.trim(),
          color: noteForm.color,
        }
      );
      if (apiError) { setNoteError(apiError); return; }
      onNoteCreated();
      handleNoteClose();
    });
  }

  return (
    <>
      {/* ── Hamburger Dropdown ── */}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            variant="flat"
            size="sm"
            isIconOnly
            className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white"
            aria-label="Menú de acciones de la partida"
          >
            <MenuIcon size={16} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Acciones de la partida"
          className="bg-zinc-800 border border-zinc-700"
          itemClasses={{
            base: 'text-zinc-300 data-[hover=true]:bg-zinc-700 data-[hover=true]:text-white rounded-lg',
          }}
        >
          <DropdownItem
            key="session"
            startContent={<CalendarIcon size={14} className="text-zinc-400" />}
            onPress={sessionModal.onOpen}
            aria-label="Nueva sesión"
          >
            Nueva sesión
          </DropdownItem>

          <DropdownItem
            key="mission"
            startContent={<FileTextIcon size={14} className="text-zinc-400" />}
            onPress={missionModal.onOpen}
            aria-label="Nueva misión"
          >
            Nueva misión
          </DropdownItem>

          <DropdownItem
            key="note"
            startContent={<EditIcon size={14} className="text-zinc-400" />}
            onPress={noteModal.onOpen}
            aria-label="Nueva nota"
          >
            Nueva nota
          </DropdownItem>

          <DropdownItem
            key="character-create"
            startContent={<UserIcon size={14} className="text-zinc-400" />}
            onPress={createCharModal.onOpen}
            aria-label="Crear personaje desde cero"
          >
            Personaje nuevo
          </DropdownItem>

          <DropdownItem
            key="character-existing"
            startContent={<UserIcon size={14} className="text-zinc-400" />}
            onPress={addExistingModal.onOpen}
            aria-label="Añadir personaje existente"
          >
            Añadir personaje existente
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* ── Session Modal ── */}
      <Modal
        isOpen={sessionModal.isOpen}
        onOpenChange={sessionModal.onOpenChange}
        onClose={handleSessionClose}
        placement="center"
        size="lg"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSessionSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nueva sesión
              </ModalHeader>
              <ModalBody className="gap-4 py-5">
                <Input
                  label="Título"
                  placeholder="Ej: El castillo oscuro"
                  value={sessionForm.title}
                  onValueChange={(val) => setSessionField('title', val)}
                  isRequired
                  isDisabled={sessionPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Título de la sesión"
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={sessionForm.date}
                  onValueChange={(val) => setSessionField('date', val)}
                  isRequired
                  isDisabled={sessionPending}
                  classNames={INPUT_CLASSES}
                  aria-label="Fecha de la sesión"
                />
                <Textarea
                  label="Notas"
                  placeholder="Resumen de lo ocurrido en la sesión..."
                  value={sessionForm.notes}
                  onValueChange={(val) => setSessionField('notes', val)}
                  isDisabled={sessionPending}
                  minRows={4}
                  maxRows={8}
                  classNames={INPUT_CLASSES}
                  aria-label="Notas de la sesión"
                />
                {sessionError && (
                  <p role="alert" className={ERROR_CLASSES}>{sessionError}</p>
                )}
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleSessionClose}
                  isDisabled={sessionPending}
                  className="text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={sessionPending}
                  isDisabled={sessionPending}
                  className="font-medium"
                >
                  {sessionPending ? 'Creando...' : 'Crear sesión'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ── Mission Modal ── */}
      <Modal
        isOpen={missionModal.isOpen}
        onOpenChange={missionModal.onOpenChange}
        onClose={handleMissionClose}
        placement="center"
        size="lg"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleMissionSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nueva misión
              </ModalHeader>
              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="Nombre de la misión"
                  value={missionForm.name}
                  onValueChange={(val) => setMissionField('name', val)}
                  isRequired
                  isDisabled={missionPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre de la misión"
                />
                <Textarea
                  label="Descripción"
                  placeholder="Describe brevemente la misión..."
                  value={missionForm.description}
                  onValueChange={(val) => setMissionField('description', val)}
                  isDisabled={missionPending}
                  minRows={2}
                  maxRows={4}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción de la misión"
                />
                <Textarea
                  label="Guía de la misión"
                  placeholder="Instrucciones o guía para el DM..."
                  value={missionForm.missionGuide}
                  onValueChange={(val) => setMissionField('missionGuide', val)}
                  isRequired
                  isDisabled={missionPending}
                  minRows={3}
                  maxRows={6}
                  classNames={INPUT_CLASSES}
                  aria-label="Guía de la misión"
                />
                <div className="flex gap-3">
                  <Select
                    label="Prioridad"
                    selectedKeys={[missionForm.missionPriority]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as MissionFormState['missionPriority'];
                      if (selected) setMissionField('missionPriority', selected);
                    }}
                    isDisabled={missionPending}
                    classNames={SELECT_CLASSES}
                    aria-label="Prioridad de la misión"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Estado"
                    selectedKeys={[missionForm.status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as MissionFormState['status'];
                      if (selected) setMissionField('status', selected);
                    }}
                    isDisabled={missionPending}
                    classNames={SELECT_CLASSES}
                    aria-label="Estado de la misión"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                {missionError && (
                  <p role="alert" className={ERROR_CLASSES}>{missionError}</p>
                )}
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleMissionClose}
                  isDisabled={missionPending}
                  className="text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={missionPending}
                  isDisabled={missionPending}
                  className="font-medium"
                >
                  {missionPending ? 'Creando...' : 'Crear misión'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ── Note Modal ── */}
      <Modal
        isOpen={noteModal.isOpen}
        onOpenChange={noteModal.onOpenChange}
        onClose={handleNoteClose}
        placement="center"
        size="lg"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleNoteSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nueva nota
              </ModalHeader>
              <ModalBody className="gap-4 py-5">
                <Textarea
                  label="Comentario"
                  placeholder="Escribe tu nota..."
                  value={noteForm.comment}
                  onValueChange={(val) => {
                    setNoteForm((prev) => ({ ...prev, comment: val }));
                    if (noteError) setNoteError(null);
                  }}
                  isRequired
                  isDisabled={notePending}
                  autoFocus
                  minRows={3}
                  maxRows={6}
                  classNames={INPUT_CLASSES}
                  aria-label="Comentario de la nota"
                />

                {/* Color picker — 6 swatches */}
                <div>
                  <p className="text-zinc-300 text-sm mb-2">Color</p>
                  <div className="flex gap-2" role="radiogroup" aria-label="Color de la nota">
                    {NOTE_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setNoteForm((prev) => ({ ...prev, color: opt.key as NoteColorKey }))}
                        className={`w-8 h-8 rounded-full ${NOTE_SWATCH_BG[opt.key as NoteColorKey]} transition-all ${
                          noteForm.color === opt.key
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        aria-label={opt.label}
                        aria-checked={noteForm.color === opt.key}
                        role="radio"
                      />
                    ))}
                  </div>
                </div>

                {noteError && (
                  <p role="alert" className={ERROR_CLASSES}>{noteError}</p>
                )}
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleNoteClose}
                  isDisabled={notePending}
                  className="text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={notePending}
                  isDisabled={notePending}
                  className="font-medium"
                >
                  {notePending ? 'Creando...' : 'Crear nota'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ── Character modals ── */}
      <CreateCharacterInPlayModal
        campaignId={campaignId}
        isOpen={createCharModal.isOpen}
        onOpenChange={createCharModal.onOpenChange}
        onCreated={onCharacterAdded}
      />

      <AddExistingCharacterModal
        campaignId={campaignId}
        assignedCharacterIds={assignedCharacterIds}
        isOpen={addExistingModal.isOpen}
        onOpenChange={addExistingModal.onOpenChange}
        onAssigned={onCharacterAdded}
      />
    </>
  );
}
