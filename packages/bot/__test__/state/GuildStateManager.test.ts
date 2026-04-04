import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { BotRecordingState, StoppedRecording } from '../../src/types/bot.js'
import { BotDatabase } from '../../src/state/BotDatabase.js'

// Mock fs/promises before importing the module under test
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}))

import * as fs from 'fs/promises'
import { GuildStateManager } from '../../src/state/GuildStateManager.js'

const mockReadFile = vi.mocked(fs.readFile)
const mockWriteFile = vi.mocked(fs.writeFile)
const mockMkdir = vi.mocked(fs.mkdir)

function makeState(guildId: string): BotRecordingState {
  return {
    guildId,
    channelId: 'channel-1',
    campaignId: 'campaign-1',
    sessionId: 'session-1',
    recordingId: 'recording-1',
    startedAt: new Date(),
    voiceConnection: {} as BotRecordingState['voiceConnection'],
    speakerBuffers: new Map(),
  }
}

describe('GuildStateManager — in-memory recording state', () => {
  let manager: GuildStateManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new GuildStateManager()
  })

  it('TC-1: get — returns undefined for unknown guild', () => {
    expect(manager.get('guild-unknown')).toBeUndefined()
  })

  it('TC-2: set + get — stores and retrieves recording state', () => {
    const state = makeState('guild-1')
    manager.set('guild-1', state)
    expect(manager.get('guild-1')).toBe(state)
  })

  it('TC-3: has — returns false when not set', () => {
    expect(manager.has('guild-1')).toBe(false)
  })

  it('TC-4: has — returns true after set', () => {
    manager.set('guild-1', makeState('guild-1'))
    expect(manager.has('guild-1')).toBe(true)
  })

  it('TC-5: delete — removes existing state', () => {
    manager.set('guild-1', makeState('guild-1'))
    manager.delete('guild-1')
    expect(manager.has('guild-1')).toBe(false)
    expect(manager.get('guild-1')).toBeUndefined()
  })

  it('TC-6: delete — no-op for unknown guild', () => {
    expect(() => manager.delete('guild-unknown')).not.toThrow()
  })
})

describe('GuildStateManager — guild settings persistence', () => {
  let manager: GuildStateManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new GuildStateManager()
  })

  it('TC-7: getDefaultCampaign — returns undefined when not loaded', () => {
    expect(manager.getDefaultCampaign('guild-1')).toBeUndefined()
  })

  it('TC-8: setDefaultCampaign — stores and retrieves default campaign', async () => {
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    await manager.setDefaultCampaign('guild-1', 'campaign-abc')
    expect(manager.getDefaultCampaign('guild-1')).toBe('campaign-abc')
  })

  it('TC-9: setDefaultCampaign — persists to guilds.json', async () => {
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    await manager.setDefaultCampaign('guild-1', 'campaign-abc')

    expect(mockWriteFile).toHaveBeenCalledOnce()
    const [, content] = mockWriteFile.mock.calls[0]
    const parsed = JSON.parse(content as string)
    expect(parsed['guild-1'].defaultCampaignId).toBe('campaign-abc')
  })

  it('TC-10: clearDefaultCampaign — removes default campaign and persists', async () => {
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    await manager.setDefaultCampaign('guild-1', 'campaign-abc')
    await manager.clearDefaultCampaign('guild-1')

    expect(manager.getDefaultCampaign('guild-1')).toBeUndefined()
    expect(mockWriteFile).toHaveBeenCalledTimes(2)
  })

  it('TC-11: loadSettings — reads guilds.json and populates settings', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ 'guild-1': { defaultCampaignId: 'campaign-xyz' } })
    )

    await manager.loadSettings()

    expect(manager.getDefaultCampaign('guild-1')).toBe('campaign-xyz')
  })

  it('TC-12: loadSettings — returns empty when file does not exist', async () => {
    const err = Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    mockReadFile.mockRejectedValue(err)

    await expect(manager.loadSettings()).resolves.not.toThrow()
    expect(manager.getDefaultCampaign('guild-1')).toBeUndefined()
  })

  it('TC-13: loadSettings — returns empty on other read error without crashing', async () => {
    mockReadFile.mockRejectedValue(new Error('disk error'))

    await expect(manager.loadSettings()).resolves.not.toThrow()
  })
})

describe('GuildStateManager — stopped recording state', () => {
  let manager: GuildStateManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new GuildStateManager()
  })

  function makeStopped(overrides: Partial<StoppedRecording> = {}): StoppedRecording {
    return {
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      stoppedAt: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    }
  }

  it('TC-14: getLastStopped — returns undefined if no state has been set', () => {
    expect(manager.getLastStopped('guild-1')).toBeUndefined()
  })

  it('TC-15: setLastStopped — stores the stopped recording state', () => {
    const stopped = makeStopped()
    manager.setLastStopped('guild-1', stopped)
    expect(manager.getLastStopped('guild-1')).toBe(stopped)
  })

  it('TC-16: clearLastStopped — removes the stopped recording state', () => {
    manager.setLastStopped('guild-1', makeStopped())
    manager.clearLastStopped('guild-1')
    expect(manager.getLastStopped('guild-1')).toBeUndefined()
  })

  it('TC-17: setLastStopped — overwrites previous stopped state', () => {
    const first = makeStopped({ recordingId: 'recording-1' })
    const second = makeStopped({ recordingId: 'recording-2' })
    manager.setLastStopped('guild-1', first)
    manager.setLastStopped('guild-1', second)
    expect(manager.getLastStopped('guild-1')).toBe(second)
  })
})

describe('GuildStateManager with BotDatabase', () => {
  let db: BotDatabase
  let manager: GuildStateManager

  function makeStopped(overrides: Partial<StoppedRecording> = {}): StoppedRecording {
    return {
      campaignId: 'campaign-1',
      recordingId: 'recording-1',
      stoppedAt: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    db = new BotDatabase(':memory:')
    manager = new GuildStateManager(db)
  })

  afterEach(() => {
    db.close()
  })

  it('TC-18: setDefaultCampaign — persists via db', async () => {
    await manager.setDefaultCampaign('guild-1', 'campaign-db')
    expect(db.getDefaultCampaign('guild-1')).toBe('campaign-db')
  })

  it('TC-19: getDefaultCampaign — reads from db', async () => {
    db.setDefaultCampaign('guild-1', 'campaign-from-db')
    expect(manager.getDefaultCampaign('guild-1')).toBe('campaign-from-db')
  })

  it('TC-20: clearDefaultCampaign — removes from db', async () => {
    await manager.setDefaultCampaign('guild-1', 'campaign-db')
    await manager.clearDefaultCampaign('guild-1')
    expect(manager.getDefaultCampaign('guild-1')).toBeUndefined()
    expect(db.getDefaultCampaign('guild-1')).toBeUndefined()
  })

  it('TC-21: setLastStopped — persists via db', () => {
    const stopped = makeStopped()
    manager.setLastStopped('guild-1', stopped)
    expect(db.getStoppedRecording('guild-1')).toBeDefined()
    expect(db.getStoppedRecording('guild-1')!.recordingId).toBe('recording-1')
  })

  it('TC-22: getLastStopped — retrieves from db with correct Date', () => {
    const stopped = makeStopped({ stoppedAt: new Date('2024-03-10T08:00:00.000Z') })
    db.setStoppedRecording('guild-1', stopped)
    const result = manager.getLastStopped('guild-1')
    expect(result).toBeDefined()
    expect(result!.stoppedAt).toBeInstanceOf(Date)
    expect(result!.stoppedAt.toISOString()).toBe('2024-03-10T08:00:00.000Z')
  })

  it('TC-23: clearLastStopped — removes from db', () => {
    manager.setLastStopped('guild-1', makeStopped())
    manager.clearLastStopped('guild-1')
    expect(manager.getLastStopped('guild-1')).toBeUndefined()
    expect(db.getStoppedRecording('guild-1')).toBeUndefined()
  })

  it('TC-24: loadSettings — is a no-op when db is provided', async () => {
    db.setDefaultCampaign('guild-1', 'campaign-already-in-db')
    // loadSettings should not wipe the db or override it with empty
    await manager.loadSettings()
    expect(manager.getDefaultCampaign('guild-1')).toBe('campaign-already-in-db')
  })

  it('TC-25: in-memory recording states (get/set/delete/has) work normally with db', () => {
    const state = makeState('guild-1')
    manager.set('guild-1', state)
    expect(manager.has('guild-1')).toBe(true)
    expect(manager.get('guild-1')).toBe(state)
    manager.delete('guild-1')
    expect(manager.has('guild-1')).toBe(false)
  })
})
