// Shared Input classNames for HeroUI dark-mode forms
export const INPUT_CLASSES = {
  label: 'text-zinc-300',
  input: 'text-white',
  inputWrapper: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
} as const;

// Shared Modal classNames
export const MODAL_CLASSES = {
  base: 'bg-zinc-900 border border-zinc-700',
  header: 'border-b border-zinc-700',
  footer: 'border-t border-zinc-700',
} as const;

// Error alert classNames
export const ERROR_CLASSES = 'text-danger-400 text-sm bg-danger-50/10 border border-danger-200/20 rounded-lg px-3 py-2';

// Status → HeroUI color
export type StatusType = 'Activa' | 'Pausada' | 'Finalizada';
export const STATUS_COLOR: Record<StatusType, 'success' | 'warning' | 'default'> = {
  Activa: 'success',
  Pausada: 'warning',
  Finalizada: 'default',
};

// Priority → HeroUI color
export type PriorityType = 'Alta' | 'Media' | 'Baja';
export const PRIORITY_COLOR: Record<string, 'danger' | 'warning' | 'default'> = {
  Alta: 'danger',
  Media: 'warning',
  Baja: 'default',
};

// Shared Select classNames for HeroUI dark-mode forms
export const SELECT_CLASSES = {
  label: 'text-zinc-300',
  value: 'text-white',
  trigger: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
  popoverContent: 'bg-zinc-800 text-white',
} as const;

// Note color → Tailwind border-l class (used by NoteItem)
export type NoteColorKey = 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'gray';
export const NOTE_BORDER_COLOR: Record<NoteColorKey, string> = {
  yellow: 'border-l-amber-400',
  blue: 'border-l-blue-400',
  green: 'border-l-emerald-400',
  red: 'border-l-rose-400',
  purple: 'border-l-purple-400',
  gray: 'border-l-zinc-400',
};

// Note color → swatch background (used by CreateNote color picker)
export const NOTE_SWATCH_BG: Record<NoteColorKey, string> = {
  yellow: 'bg-amber-400',
  blue: 'bg-blue-400',
  green: 'bg-emerald-400',
  red: 'bg-rose-400',
  purple: 'bg-purple-400',
  gray: 'bg-zinc-400',
};
