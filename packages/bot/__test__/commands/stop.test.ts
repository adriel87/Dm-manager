import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { BotRecordingState } from '../../src/types/bot.js'
import { resolveStopCommand } from '../../src/commands/dm-record/stop.js'

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

describe('resolveStopCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: no active recording — returns error', () => {
    const result = resolveStopCommand(undefined)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })

  it('TC-2: active recording — returns ok with campaignId and recordingId', () => {
    const result = resolveStopCommand(makeState())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.campaignId).toBe('campaign-1')
      expect(result.recordingId).toBe('recording-1')
    }
  })
})
