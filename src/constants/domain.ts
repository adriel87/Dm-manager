// ─── Mission / Campaign shared options ────────────────────────────────────────

export const STATUS_OPTIONS = [
  { key: 'Activa', label: 'Activa' },
  { key: 'Pausada', label: 'Pausada' },
  { key: 'Finalizada', label: 'Finalizada' },
] as const;

export type StatusOption = (typeof STATUS_OPTIONS)[number]['key'];

// ─── Mission priority options ──────────────────────────────────────────────────

export const PRIORITY_OPTIONS = [
  { key: 'Alta', label: 'Alta' },
  { key: 'Media', label: 'Media' },
  { key: 'Baja', label: 'Baja' },
] as const;

export type PriorityOption = (typeof PRIORITY_OPTIONS)[number]['key'];

// ─── Note color options ────────────────────────────────────────────────────────

export const NOTE_COLOR_OPTIONS = [
  { key: 'yellow', label: 'Amarillo' },
  { key: 'blue', label: 'Azul' },
  { key: 'green', label: 'Verde' },
  { key: 'red', label: 'Rojo' },
  { key: 'purple', label: 'Púrpura' },
  { key: 'gray', label: 'Gris' },
] as const;

export type NoteColorOption = (typeof NOTE_COLOR_OPTIONS)[number]['key'];
