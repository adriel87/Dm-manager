/**
 * BotDatabase.ts
 *
 * SQLite persistence layer for the DM Manager bot.
 * Replaces guilds.json (GuildSettings) and the in-memory StoppedRecording Map.
 *
 * Uses better-sqlite3 (synchronous API) — no async/await needed.
 */

import Database from 'better-sqlite3'
import type { StoppedRecording } from '../types/bot.js'

export class BotDatabase {
  private db: Database.Database

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.initialize()
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        default_campaign_id TEXT
      );

      CREATE TABLE IF NOT EXISTS stopped_recordings (
        guild_id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        recording_id TEXT NOT NULL,
        stopped_at TEXT NOT NULL
      );
    `)
  }

  // ============================================================
  // Guild settings
  // ============================================================

  getDefaultCampaign(guildId: string): string | undefined {
    const row = this.db
      .prepare('SELECT default_campaign_id FROM guild_settings WHERE guild_id = ?')
      .get(guildId) as { default_campaign_id: string | null } | undefined

    return row?.default_campaign_id ?? undefined
  }

  setDefaultCampaign(guildId: string, campaignId: string): void {
    this.db
      .prepare(`
        INSERT INTO guild_settings (guild_id, default_campaign_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET default_campaign_id = excluded.default_campaign_id
      `)
      .run(guildId, campaignId)
  }

  clearDefaultCampaign(guildId: string): void {
    this.db
      .prepare('DELETE FROM guild_settings WHERE guild_id = ?')
      .run(guildId)
  }

  // ============================================================
  // Stopped recordings
  // ============================================================

  getStoppedRecording(guildId: string): StoppedRecording | undefined {
    const row = this.db
      .prepare('SELECT campaign_id, recording_id, stopped_at FROM stopped_recordings WHERE guild_id = ?')
      .get(guildId) as { campaign_id: string; recording_id: string; stopped_at: string } | undefined

    if (!row) return undefined

    return {
      campaignId: row.campaign_id,
      recordingId: row.recording_id,
      stoppedAt: new Date(row.stopped_at),
    }
  }

  setStoppedRecording(guildId: string, stopped: StoppedRecording): void {
    this.db
      .prepare(`
        INSERT INTO stopped_recordings (guild_id, campaign_id, recording_id, stopped_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET
          campaign_id = excluded.campaign_id,
          recording_id = excluded.recording_id,
          stopped_at = excluded.stopped_at
      `)
      .run(guildId, stopped.campaignId, stopped.recordingId, stopped.stoppedAt.toISOString())
  }

  clearStoppedRecording(guildId: string): void {
    this.db
      .prepare('DELETE FROM stopped_recordings WHERE guild_id = ?')
      .run(guildId)
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  close(): void {
    this.db.close()
  }
}
