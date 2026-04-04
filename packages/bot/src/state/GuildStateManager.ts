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
import type { BotDatabase } from './BotDatabase.js'

// Path to persisted settings file, relative to package root (packages/bot/)
const DATA_DIR = join(process.cwd(), 'data')
const GUILDS_FILE = join(DATA_DIR, 'guilds.json')

export class GuildStateManager {
  // In-memory recording state (Phase 2/3)
  private readonly recordingStates = new Map<string, BotRecordingState>()

  // Stopped recording state (Phase 4) — lightweight, cleared after transcription
  // Only used when no db is provided (legacy in-memory mode)
  private readonly stoppedStates = new Map<string, StoppedRecording>()

  // Guild persistent settings (loaded from / saved to guilds.json)
  // Only used when no db is provided (legacy file mode)
  private settings: GuildSettingsStore = {}

  // Optional SQLite database (Phase 6) — replaces guilds.json + stoppedStates Map
  private readonly db?: BotDatabase

  constructor(db?: BotDatabase) {
    this.db = db
  }

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
    if (this.db) {
      this.db.setStoppedRecording(guildId, stopped)
    } else {
      this.stoppedStates.set(guildId, stopped)
    }
  }

  getLastStopped(guildId: string): StoppedRecording | undefined {
    if (this.db) {
      return this.db.getStoppedRecording(guildId)
    }
    return this.stoppedStates.get(guildId)
  }

  clearLastStopped(guildId: string): void {
    if (this.db) {
      this.db.clearStoppedRecording(guildId)
    } else {
      this.stoppedStates.delete(guildId)
    }
  }

  // ============================================================
  // Guild settings persistence
  // ============================================================

  getDefaultCampaign(guildId: string): string | undefined {
    if (this.db) {
      return this.db.getDefaultCampaign(guildId)
    }
    return this.settings[guildId]?.defaultCampaignId
  }

  async setDefaultCampaign(guildId: string, campaignId: string): Promise<void> {
    if (this.db) {
      this.db.setDefaultCampaign(guildId, campaignId)
      return
    }
    this.settings[guildId] = {
      ...this.settings[guildId],
      defaultCampaignId: campaignId,
    }
    await this.persist()
  }

  async clearDefaultCampaign(guildId: string): Promise<void> {
    if (this.db) {
      this.db.clearDefaultCampaign(guildId)
      return
    }
    if (this.settings[guildId]) {
      const { defaultCampaignId: _, ...rest } = this.settings[guildId]
      this.settings[guildId] = rest as GuildSettings
    }
    await this.persist()
  }

  /**
   * Reads data/guilds.json on startup.
   * No-op when a BotDatabase is provided (data already lives in SQLite).
   * If the file does not exist, silently returns with empty settings.
   */
  async loadSettings(): Promise<void> {
    if (this.db) {
      // SQLite already has all data — nothing to load
      return
    }
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
