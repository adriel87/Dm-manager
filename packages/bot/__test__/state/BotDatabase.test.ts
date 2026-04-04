import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BotDatabase } from '../../src/state/BotDatabase.js'
import type { StoppedRecording } from '../../src/types/bot.js'

function makeStopped(overrides: Partial<StoppedRecording> = {}): StoppedRecording {
  return {
    campaignId: 'campaign-1',
    recordingId: 'recording-1',
    stoppedAt: new Date('2024-06-15T12:00:00.000Z'),
    ...overrides,
  }
}

describe('BotDatabase', () => {
  let db: BotDatabase

  beforeEach(() => {
    db = new BotDatabase(':memory:')
  })

  afterEach(() => {
    db.close()
  })

  // ============================================================
  // Guild settings
  // ============================================================

  it('TC-1: getDefaultCampaign — returns undefined if no entry exists', () => {
    expect(db.getDefaultCampaign('guild-1')).toBeUndefined()
  })

  it('TC-2: setDefaultCampaign + getDefaultCampaign — saves and retrieves value', () => {
    db.setDefaultCampaign('guild-1', 'campaign-abc')
    expect(db.getDefaultCampaign('guild-1')).toBe('campaign-abc')
  })

  it('TC-3: setDefaultCampaign — overwrites previous value', () => {
    db.setDefaultCampaign('guild-1', 'campaign-old')
    db.setDefaultCampaign('guild-1', 'campaign-new')
    expect(db.getDefaultCampaign('guild-1')).toBe('campaign-new')
  })

  it('TC-4: clearDefaultCampaign — removes the value', () => {
    db.setDefaultCampaign('guild-1', 'campaign-abc')
    db.clearDefaultCampaign('guild-1')
    expect(db.getDefaultCampaign('guild-1')).toBeUndefined()
  })

  it('TC-5: clearDefaultCampaign — is a no-op if entry does not exist', () => {
    expect(() => db.clearDefaultCampaign('guild-unknown')).not.toThrow()
    expect(db.getDefaultCampaign('guild-unknown')).toBeUndefined()
  })

  // ============================================================
  // Stopped recordings
  // ============================================================

  it('TC-6: getStoppedRecording — returns undefined if no entry exists', () => {
    expect(db.getStoppedRecording('guild-1')).toBeUndefined()
  })

  it('TC-7: setStoppedRecording + getStoppedRecording — saves and retrieves with correct Date', () => {
    const stopped = makeStopped()
    db.setStoppedRecording('guild-1', stopped)

    const result = db.getStoppedRecording('guild-1')
    expect(result).toBeDefined()
    expect(result!.campaignId).toBe('campaign-1')
    expect(result!.recordingId).toBe('recording-1')
    expect(result!.stoppedAt).toBeInstanceOf(Date)
    expect(result!.stoppedAt.toISOString()).toBe('2024-06-15T12:00:00.000Z')
  })

  it('TC-8: setStoppedRecording — overwrites previous entry', () => {
    db.setStoppedRecording('guild-1', makeStopped({ recordingId: 'recording-old' }))
    db.setStoppedRecording('guild-1', makeStopped({ recordingId: 'recording-new' }))

    const result = db.getStoppedRecording('guild-1')
    expect(result!.recordingId).toBe('recording-new')
  })

  it('TC-9: clearStoppedRecording — removes the entry', () => {
    db.setStoppedRecording('guild-1', makeStopped())
    db.clearStoppedRecording('guild-1')
    expect(db.getStoppedRecording('guild-1')).toBeUndefined()
  })

  it('TC-10: clearStoppedRecording — is a no-op if entry does not exist', () => {
    expect(() => db.clearStoppedRecording('guild-unknown')).not.toThrow()
    expect(db.getStoppedRecording('guild-unknown')).toBeUndefined()
  })

  // ============================================================
  // Isolation
  // ============================================================

  it('TC-11: data from one guildId does not affect another guildId', () => {
    db.setDefaultCampaign('guild-1', 'campaign-a')
    db.setStoppedRecording('guild-1', makeStopped({ recordingId: 'rec-1' }))

    expect(db.getDefaultCampaign('guild-2')).toBeUndefined()
    expect(db.getStoppedRecording('guild-2')).toBeUndefined()
  })

  it('TC-12: separate :memory: instances are independent', () => {
    const db2 = new BotDatabase(':memory:')
    try {
      db.setDefaultCampaign('guild-1', 'campaign-a')
      db.setStoppedRecording('guild-1', makeStopped())

      expect(db2.getDefaultCampaign('guild-1')).toBeUndefined()
      expect(db2.getStoppedRecording('guild-1')).toBeUndefined()
    } finally {
      db2.close()
    }
  })
})
