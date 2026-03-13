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
