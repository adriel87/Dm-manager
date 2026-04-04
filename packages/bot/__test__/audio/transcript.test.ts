import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TranscriptionSegment } from '../../src/types/dm-manager.js'
import { formatTranscriptForDiscord } from '../../src/audio/transcript.js'

function makeSegment(overrides: Partial<TranscriptionSegment> = {}): TranscriptionSegment {
  return {
    speakerDiscordUserId: 'user-1',
    speakerLabel: 'Adriel',
    text: 'Intento abrir la cerradura.',
    startTime: 125,
    endTime: 127,
    ...overrides,
  }
}

describe('formatTranscriptForDiscord', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: segmento único formatea correctamente', () => {
    const segments: TranscriptionSegment[] = [
      makeSegment({ speakerLabel: 'Adriel', text: 'Intento abrir la cerradura.', startTime: 125 }),
    ]
    const result = formatTranscriptForDiscord(segments)
    expect(result).toBe('**Adriel** [02:05]: Intento abrir la cerradura.')
  })

  it('TC-2: múltiples segmentos separados por newline', () => {
    const segments: TranscriptionSegment[] = [
      makeSegment({ speakerLabel: 'Adriel', text: 'Intento abrir la cerradura.', startTime: 125 }),
      makeSegment({ speakerLabel: 'DM', text: 'El cofre cruje y se abre lentamente.', startTime: 127 }),
    ]
    const result = formatTranscriptForDiscord(segments)
    expect(result).toBe(
      '**Adriel** [02:05]: Intento abrir la cerradura.\n**DM** [02:07]: El cofre cruje y se abre lentamente.'
    )
  })

  it('TC-3: timestamps se formatean como MM:SS', () => {
    const segments: TranscriptionSegment[] = [
      makeSegment({ startTime: 65 }),
    ]
    const result = formatTranscriptForDiscord(segments)
    expect(result).toContain('[01:05]')
  })

  it('TC-4: timestamps >= 60s usan minutos correctamente (125s → 02:05)', () => {
    const segments: TranscriptionSegment[] = [
      makeSegment({ startTime: 125 }),
    ]
    const result = formatTranscriptForDiscord(segments)
    expect(result).toContain('[02:05]')
  })

  it('TC-5: array vacío retorna mensaje de placeholder', () => {
    const result = formatTranscriptForDiscord([])
    expect(result).toBe('(sin segmentos de transcripción)')
  })

  it('TC-6: resultado que excede maxLength se trunca', () => {
    const longText = 'A'.repeat(200)
    const segments: TranscriptionSegment[] = Array.from({ length: 20 }, (_, i) =>
      makeSegment({ speakerLabel: 'Speaker', text: longText, startTime: i * 10 })
    )
    const result = formatTranscriptForDiscord(segments)
    expect(result.length).toBeLessThanOrEqual(1900 + '\n…(truncado)'.length)
    expect(result).toContain('…(truncado)')
  })

  it('TC-7: maxLength custom funciona', () => {
    const segments: TranscriptionSegment[] = [
      makeSegment({ speakerLabel: 'Adriel', text: 'Hola mundo', startTime: 0 }),
      makeSegment({ speakerLabel: 'DM', text: 'Bienvenido', startTime: 5 }),
    ]
    const result = formatTranscriptForDiscord(segments, 30)
    expect(result).toContain('…(truncado)')
    expect(result.length).toBeLessThanOrEqual(30 + '\n…(truncado)'.length)
  })
})
