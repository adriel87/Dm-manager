import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { BotRecordingState } from '../../src/types/bot.js'
import { resolveStatusCommand } from '../../src/commands/dm-record/status.js'

function makeState(overrides: Partial<BotRecordingState> = {}): BotRecordingState {
  return {
    guildId: 'guild-1',
    channelId: 'channel-1',
    campaignId: 'campaign-1',
    sessionId: 'session-1',
    recordingId: 'recording-1',
    startedAt: new Date('2024-01-01T10:00:00Z'),
    voiceConnection: {} as BotRecordingState['voiceConnection'],
    speakerBuffers: new Map([['user-1', []], ['user-2', []]]),
    ...overrides,
  }
}

describe('resolveStatusCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: no active state — returns idle status', () => {
    const result = resolveStatusCommand(undefined)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.status).toBe('idle')
  })

  it('TC-2: active state — returns recording status with all fields', () => {
    const state = makeState()
    const result = resolveStatusCommand(state)
    expect(result.ok).toBe(true)
    if (result.ok && result.status === 'recording') {
      expect(result.campaignId).toBe('campaign-1')
      expect(result.sessionId).toBe('session-1')
      expect(result.recordingId).toBe('recording-1')
      expect(result.startedAt).toBeInstanceOf(Date)
      expect(result.speakerCount).toBe(2)
    }
  })

  it('TC-3: active state with no speakers — speakerCount is 0', () => {
    const state = makeState({ speakerBuffers: new Map() })
    const result = resolveStatusCommand(state)
    expect(result.ok).toBe(true)
    if (result.ok && result.status === 'recording') {
      expect(result.speakerCount).toBe(0)
    }
  })
})
