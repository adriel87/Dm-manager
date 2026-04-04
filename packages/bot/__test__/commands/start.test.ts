import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveStartCommand } from '../../src/commands/dm-record/start.js'

describe('resolveStartCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: user not in voice channel — returns error', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: 'campaign-1',
      defaultCampaignId: undefined,
      hasVoiceChannel: false,
      isAlreadyRecording: false,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/voice/i)
  })

  it('TC-2: already recording — returns error', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: 'campaign-1',
      defaultCampaignId: undefined,
      hasVoiceChannel: true,
      isAlreadyRecording: true,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/recording/i)
  })

  it('TC-3: no campaign ID and no default — returns error', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: null,
      defaultCampaignId: undefined,
      hasVoiceChannel: true,
      isAlreadyRecording: false,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/campaign/i)
  })

  it('TC-4: campaign provided by option — returns ok', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: 'campaign-abc',
      defaultCampaignId: undefined,
      hasVoiceChannel: true,
      isAlreadyRecording: false,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.campaignId).toBe('campaign-abc')
      expect(result.sessionId).toBe('session-1')
    }
  })

  it('TC-5: campaign from default (option is null) — returns ok', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: null,
      defaultCampaignId: 'campaign-default',
      hasVoiceChannel: true,
      isAlreadyRecording: false,
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.campaignId).toBe('campaign-default')
  })

  it('TC-6: option overrides default campaign — uses option', () => {
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: 'campaign-explicit',
      defaultCampaignId: 'campaign-default',
      hasVoiceChannel: true,
      isAlreadyRecording: false,
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.campaignId).toBe('campaign-explicit')
  })

  it('TC-7: voice check takes priority over recording check', () => {
    // No voice channel AND already recording — voice error should win
    const result = resolveStartCommand({
      sessionId: 'session-1',
      campaignIdOption: 'campaign-1',
      defaultCampaignId: undefined,
      hasVoiceChannel: false,
      isAlreadyRecording: true,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/voice/i)
  })
})
