import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { BotRecordingState, StoppedRecording } from '../../src/types/bot.js'
import { resolveTranscribeCommand } from '../../src/commands/dm-record/transcribe.js'

function makeState(overrides: Partial<BotRecordingState> = {}): BotRecordingState {
  return {
    guildId: 'guild-1',
    channelId: 'channel-1',
    campaignId: 'campaign-1',
    sessionId: 'session-1',
    recordingId: 'recording-1',
    startedAt: new Date(),
    voiceConnection: {} as BotRecordingState['voiceConnection'],
    speakerBuffers: new Map(),
    ...overrides,
  }
}

function makeStopped(overrides: Partial<StoppedRecording> = {}): StoppedRecording {
  return {
    campaignId: 'campaign-stopped',
    recordingId: 'recording-stopped',
    stoppedAt: new Date(),
    ...overrides,
  }
}

describe('resolveTranscribeCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: no activeState nor lastStopped — returns error', () => {
    const result = resolveTranscribeCommand({ activeState: undefined, lastStopped: undefined, language: null })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })

  it('TC-2: lastStopped present, no language — returns ok with default language "es"', () => {
    const result = resolveTranscribeCommand({
      activeState: undefined,
      lastStopped: makeStopped(),
      language: null,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.language).toBe('es')
      expect(result.campaignId).toBe('campaign-stopped')
      expect(result.recordingId).toBe('recording-stopped')
    }
  })

  it('TC-3: lastStopped present, explicit language — uses provided language', () => {
    const result = resolveTranscribeCommand({
      activeState: undefined,
      lastStopped: makeStopped(),
      language: 'en',
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.language).toBe('en')
  })

  it('TC-4: retorna error si hay grabación activa (activeState definido)', () => {
    const result = resolveTranscribeCommand({
      activeState: makeState(),
      lastStopped: undefined,
      language: null,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('stop')
  })

  it('TC-5: usa lastStopped cuando no hay activeState', () => {
    const stopped = makeStopped({ campaignId: 'camp-abc', recordingId: 'rec-xyz' })
    const result = resolveTranscribeCommand({
      activeState: undefined,
      lastStopped: stopped,
      language: null,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.campaignId).toBe('camp-abc')
      expect(result.recordingId).toBe('rec-xyz')
    }
  })

  it('TC-6: retorna error si no hay ni activeState ni lastStopped', () => {
    const result = resolveTranscribeCommand({
      activeState: undefined,
      lastStopped: undefined,
      language: 'es',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })
})
