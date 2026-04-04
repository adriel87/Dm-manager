import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { BotRecordingState } from '../../src/types/bot.js'
import { handleVoiceStateUpdate } from '../../src/handlers/voiceStateUpdate.js'

function makeGuildState(recordingState?: BotRecordingState) {
  const deleteGuild = vi.fn()
  const has = vi.fn().mockReturnValue(recordingState !== undefined)
  const get = vi.fn().mockReturnValue(recordingState)
  return { delete: deleteGuild, has, get } as unknown as import('../../src/state/GuildStateManager.js').GuildStateManager
}

function makeBotOldState(channelId: string | null, guildId = 'guild-1') {
  return {
    member: { user: { bot: true } },
    channelId,
    guild: { id: guildId },
  }
}

function makeUserOldState(channelId: string | null, guildId = 'guild-1') {
  return {
    member: { user: { bot: false } },
    channelId,
    guild: { id: guildId },
  }
}

function makeNewState(channelId: string | null) {
  return { channelId }
}

describe('handleVoiceStateUpdate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: bot disconnected with active recording — deletes state', async () => {
    const recording: BotRecordingState = {
      guildId: 'guild-1',
      channelId: 'channel-1',
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      recordingId: 'recording-1',
      startedAt: new Date(),
      voiceConnection: {} as BotRecordingState['voiceConnection'],
      speakerBuffers: new Map(),
    }
    const guildState = makeGuildState(recording)

    await handleVoiceStateUpdate(
      makeBotOldState('channel-1') as never,
      makeNewState(null) as never,
      guildState
    )

    expect(guildState.delete).toHaveBeenCalledWith('guild-1')
  })

  it('TC-2: bot disconnected with no active recording — no delete called', async () => {
    const guildState = makeGuildState(undefined)

    await handleVoiceStateUpdate(
      makeBotOldState('channel-1') as never,
      makeNewState(null) as never,
      guildState
    )

    expect(guildState.delete).not.toHaveBeenCalled()
  })

  it('TC-3: user (not bot) changes channel — ignored entirely', async () => {
    const guildState = makeGuildState()

    await handleVoiceStateUpdate(
      makeUserOldState('channel-1') as never,
      makeNewState('channel-2') as never,
      guildState
    )

    expect(guildState.delete).not.toHaveBeenCalled()
  })

  it('TC-4: bot was already not in a channel (no oldState.channelId) — ignored', async () => {
    const guildState = makeGuildState()

    await handleVoiceStateUpdate(
      makeBotOldState(null) as never,
      makeNewState(null) as never,
      guildState
    )

    expect(guildState.delete).not.toHaveBeenCalled()
  })

  it('TC-5: bot moved to different channel (not disconnected) — ignored', async () => {
    const guildState = makeGuildState()

    await handleVoiceStateUpdate(
      makeBotOldState('channel-1') as never,
      makeNewState('channel-2') as never,
      guildState
    )

    expect(guildState.delete).not.toHaveBeenCalled()
  })
})
