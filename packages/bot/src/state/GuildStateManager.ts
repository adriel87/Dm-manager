/**
 * GuildStateManager.ts
 *
 * Manages two types of per-guild state:
 * 1. In-memory recording state (BotRecordingState) — ephemeral, lost on restart
 * 2. Persistent guild settings (default campaign ID) — saved to data/guilds.json
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { BotRecordingState, GuildSettings, GuildSettingsStore, StoppedRecording } from '../types/bot.js'

// Path to persisted settings file, relative to package root (packages/bot/)
const DATA_DIR = join(process.cwd(), 'data')
const GUILDS_FILE = join(DATA_DIR, 'guilds.json')

export class GuildStateManager {
  // In-memory recording state (Phase 2/3)
  private readonly recordingStates = new Map<string, BotRecordingState>()

  // Stopped recording state (Phase 4) — lightweight, cleared after transcription
  private readonly stoppedStates = new Map<string, StoppedRecording>()

  // Guild persistent settings (loaded from / saved to guilds.json)
  private settings: GuildSettingsStore = {}

  // ============================================================
  // In-memory recording state
  // ============================================================

  get(guildId: string): BotRecordingState | undefined {
    return this.recordingStates.get(guildId)
  }

  set(guildId: string, state: BotRecordingState): void {
    this.recordingStates.set(guildId, state)
  }

  delete(guildId: string): void {
    this.recordingStates.delete(guildId)
  }

  has(guildId: string): boolean {
    return this.recordingStates.has(guildId)
  }

  // ============================================================
  // Stopped recording state (Phase 4)
  // ============================================================

  setLastStopped(guildId: string, stopped: StoppedRecording): void {
    this.stoppedStates.set(guildId, stopped)
  }

  getLastStopped(guildId: string): StoppedRecording | undefined {
    return this.stoppedStates.get(guildId)
  }

  clearLastStopped(guildId: string): void {
    this.stoppedStates.delete(guildId)
  }

  // ============================================================
  // Guild settings persistence
  // ============================================================

  getDefaultCampaign(guildId: string): string | undefined {
    return this.settings[guildId]?.defaultCampaignId
  }

  async setDefaultCampaign(guildId: string, campaignId: string): Promise<void> {
    this.settings[guildId] = {
      ...this.settings[guildId],
      defaultCampaignId: campaignId,
    }
    await this.persist()
  }

  async clearDefaultCampaign(guildId: string): Promise<void> {
    if (this.settings[guildId]) {
      const { defaultCampaignId: _, ...rest } = this.settings[guildId]
      this.settings[guildId] = rest as GuildSettings
    }
    await this.persist()
  }

  /**
   * Reads data/guilds.json on startup.
   * If the file does not exist, silently returns with empty settings.
   */
  async loadSettings(): Promise<void> {
    try {
      const content = await readFile(GUILDS_FILE, 'utf-8')
      this.settings = JSON.parse(content) as GuildSettingsStore
    } catch (err) {
      // ENOENT is expected on first run — all other errors are logged but swallowed
      const code = (err as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        console.warn('[GuildStateManager] Could not load guilds.json:', err)
      }
      this.settings = {}
    }
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private async persist(): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(GUILDS_FILE, JSON.stringify(this.settings, null, 2), 'utf-8')
  }
}
