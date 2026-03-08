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
