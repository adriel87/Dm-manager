'use client';

import { useEffect } from 'react';

/**
 * Custom hook to warn users before leaving the page with unsaved changes.
 * Triggers the browser's native "beforeunload" confirmation dialog.
 *
 * @param shouldBlock - Whether to show the warning (typically: hasUnsavedChanges)
 * @param message - Custom message (note: modern browsers ignore this and show a generic message)
 *
 * @example
 * ```tsx
 * const [notes, setNotes] = useState('');
 * const [savedNotes, setSavedNotes] = useState('');
 * const hasUnsavedChanges = notes !== savedNotes;
 *
 * useBeforeUnload(hasUnsavedChanges);
 * ```
 */
export function useBeforeUnload(
  shouldBlock: boolean,
  message = '¿Estás seguro? Tienes cambios sin guardar.'
): void {
  useEffect(() => {
    if (!shouldBlock) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Modern browsers ignore custom messages but we set it anyway for older browsers
      e.returnValue = message;
      return message;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock, message]);
}
