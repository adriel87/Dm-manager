import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Recording } from '../../src/types/dm-manager.js'
import { pollUntilTranscribed } from '../../src/audio/poller.js'

function makeRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 'recording-1',
    campaignId: 'campaign-1',
    sessionId: 'session-1',
    status: 'transcribed',
    audioFilePath: null,
    durationSeconds: null,
    speakers: [],
    transcription: [],
    transcriptionProvider: null,
    transcriptionError: null,
    discordGuildId: 'guild-1',
    discordChannelId: 'channel-1',
    startedAt: '2024-01-01T00:00:00.000Z',
    stoppedAt: null,
    transcribedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('pollUntilTranscribed', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: retorna ok cuando status es "transcribed"', async () => {
    const recording = makeRecording({ status: 'transcribed' })
    const getRecordings = vi.fn().mockResolvedValue([recording])

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 3,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.recording).toBe(recording)
    }
  })

  it('TC-2: retorna ok: false cuando status es "failed"', async () => {
    const recording = makeRecording({ status: 'failed', transcriptionError: null })
    const getRecordings = vi.fn().mockResolvedValue([recording])

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 3,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBeTruthy()
    }
  })

  it('TC-3: retorna ok: false cuando se agotan los intentos', async () => {
    const recording = makeRecording({ status: 'processing' })
    const getRecordings = vi.fn().mockResolvedValue([recording])

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 3,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Timeout')
    }
    expect(getRecordings).toHaveBeenCalledTimes(3)
  })

  it('TC-4: sigue intentando si el recording no está en la respuesta todavía', async () => {
    const recording = makeRecording({ status: 'transcribed' })
    const getRecordings = vi
      .fn()
      .mockResolvedValueOnce([])           // attempt 1: not found
      .mockResolvedValueOnce([recording])  // attempt 2: found

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 5,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(true)
    expect(getRecordings).toHaveBeenCalledTimes(2)
  })

  it('TC-5: sigue intentando si status es "recording" o "processing"', async () => {
    const processing = makeRecording({ status: 'processing' })
    const transcribed = makeRecording({ status: 'transcribed' })
    const getRecordings = vi
      .fn()
      .mockResolvedValueOnce([makeRecording({ status: 'recording' })])
      .mockResolvedValueOnce([processing])
      .mockResolvedValueOnce([transcribed])

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 5,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(true)
    expect(getRecordings).toHaveBeenCalledTimes(3)
  })

  it('TC-6: usa el transcriptionError en el mensaje de error si está disponible', async () => {
    const recording = makeRecording({
      status: 'failed',
      transcriptionError: 'Audio file corrupted',
    })
    const getRecordings = vi.fn().mockResolvedValue([recording])

    const result = await pollUntilTranscribed({
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      maxAttempts: 3,
      intervalMs: 0,
      client: { getRecordings },
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Audio file corrupted')
    }
  })
})
