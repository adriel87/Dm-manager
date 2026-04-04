import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { GuildStateManager } from '../../src/state/GuildStateManager.js'
import type { DmManagerClient } from '../../src/types/client.js'

// Mock the command handlers so we can spy on routing
vi.mock('../../src/commands/dm-record/link.js', () => ({
  resolveLinkCommand: vi.fn(() => ({ ok: true, campaignId: 'c1' })),
  handleLink: vi.fn(),
}))
vi.mock('../../src/commands/dm-record/status.js', () => ({
  resolveStatusCommand: vi.fn(() => ({ ok: true, status: 'idle' })),
  handleStatus: vi.fn(),
}))
vi.mock('../../src/commands/dm-record/start.js', () => ({
  resolveStartCommand: vi.fn(() => ({ ok: true, campaignId: 'c1', sessionId: 's1' })),
  handleStart: vi.fn(),
}))
vi.mock('../../src/commands/dm-record/stop.js', () => ({
  resolveStopCommand: vi.fn(() => ({ ok: false, error: 'no recording' })),
  handleStop: vi.fn(),
}))
vi.mock('../../src/commands/dm-record/transcribe.js', () => ({
  resolveTranscribeCommand: vi.fn(() => ({ ok: false, error: 'no recording' })),
  handleTranscribe: vi.fn(),
}))

import { handleInteraction } from '../../src/handlers/interactionCreate.js'
import { handleLink } from '../../src/commands/dm-record/link.js'
import { handleStatus } from '../../src/commands/dm-record/status.js'
import { handleStart } from '../../src/commands/dm-record/start.js'
import { handleStop } from '../../src/commands/dm-record/stop.js'
import { handleTranscribe } from '../../src/commands/dm-record/transcribe.js'

function makeInteraction(commandName: string, subcommand: string) {
  const reply = vi.fn().mockResolvedValue(undefined)
  return {
    isAutocomplete: () => false,
    isChatInputCommand: () => true,
    commandName,
    options: {
      getSubcommand: () => subcommand,
    },
    reply,
    guildId: 'guild-1',
  }
}

function makeNonCommandInteraction() {
  return {
    isAutocomplete: () => false,
    isChatInputCommand: () => false,
  }
}

const mockState = {} as GuildStateManager
const mockClient = {} as DmManagerClient

describe('handleInteraction — routing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: non-command interaction — ignored (no error thrown)', async () => {
    const interaction = makeNonCommandInteraction()
    await expect(handleInteraction(interaction as never, mockState, mockClient)).resolves.not.toThrow()
  })

  it('TC-2: unknown command name — ignored', async () => {
    const interaction = makeInteraction('other-command', 'link')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleLink).not.toHaveBeenCalled()
  })

  it('TC-3: dm-record link — routes to handleLink', async () => {
    const interaction = makeInteraction('dm-record', 'link')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleLink).toHaveBeenCalledOnce()
    expect(handleLink).toHaveBeenCalledWith(interaction, mockState)
  })

  it('TC-4: dm-record status — routes to handleStatus', async () => {
    const interaction = makeInteraction('dm-record', 'status')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleStatus).toHaveBeenCalledOnce()
    expect(handleStatus).toHaveBeenCalledWith(interaction, mockState)
  })

  it('TC-5: dm-record start — routes to handleStart', async () => {
    const interaction = makeInteraction('dm-record', 'start')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleStart).toHaveBeenCalledOnce()
    expect(handleStart).toHaveBeenCalledWith(interaction, mockState, mockClient)
  })

  it('TC-6: dm-record stop — routes to handleStop', async () => {
    const interaction = makeInteraction('dm-record', 'stop')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleStop).toHaveBeenCalledOnce()
    expect(handleStop).toHaveBeenCalledWith(interaction, mockState, mockClient)
  })

  it('TC-7: dm-record transcribe — routes to handleTranscribe', async () => {
    const interaction = makeInteraction('dm-record', 'transcribe')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(handleTranscribe).toHaveBeenCalledOnce()
    expect(handleTranscribe).toHaveBeenCalledWith(interaction, mockState, mockClient)
  })

  it('TC-8: unknown subcommand — replies with ephemeral unknown command message', async () => {
    const interaction = makeInteraction('dm-record', 'unknown-sub')
    await handleInteraction(interaction as never, mockState, mockClient)
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    )
  })
})
