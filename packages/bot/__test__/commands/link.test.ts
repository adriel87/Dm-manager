import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveLinkCommand } from '../../src/commands/dm-record/link.js'

describe('resolveLinkCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: empty string — returns error', () => {
    const result = resolveLinkCommand('')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })

  it('TC-2: whitespace only — returns error', () => {
    const result = resolveLinkCommand('   ')
    expect(result.ok).toBe(false)
  })

  it('TC-3: valid campaign ID — returns ok with trimmed ID', () => {
    const result = resolveLinkCommand('  abc123  ')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.campaignId).toBe('abc123')
  })

  it('TC-4: valid campaign ID without spaces — returns same ID', () => {
    const result = resolveLinkCommand('campaign-xyz')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.campaignId).toBe('campaign-xyz')
  })
})
