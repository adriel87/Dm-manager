/**
 * transcript.ts
 *
 * Pure utility: formats TranscriptionSegment[] into a Discord-friendly string.
 */

import type { TranscriptionSegment } from '../types/dm-manager.js'

const DEFAULT_MAX_LENGTH = 1900
const TRUNCATION_SUFFIX = '\n…(truncado)'

/**
 * Formats a seconds value as MM:SS (e.g. 125 → "02:05").
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Formats an array of TranscriptionSegment into a Discord message string.
 *
 * Each segment renders as:
 *   **SpeakerLabel** [MM:SS]: text
 *
 * If the result exceeds maxLength, it is truncated and "…(truncado)" is appended.
 * Returns a placeholder string when segments is empty.
 */
export function formatTranscriptForDiscord(
  segments: TranscriptionSegment[],
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  if (segments.length === 0) {
    return '(sin segmentos de transcripción)'
  }

  const lines = segments.map(
    (seg) => `**${seg.speakerLabel}** [${formatTimestamp(seg.startTime)}]: ${seg.text}`
  )

  const full = lines.join('\n')

  if (full.length <= maxLength) {
    return full
  }

  // Truncate to fit within maxLength, then append the suffix
  const truncated = full.slice(0, maxLength)
  return truncated + TRUNCATION_SUFFIX
}
