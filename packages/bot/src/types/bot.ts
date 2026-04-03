/**
 * bot.ts
 *
 * Internal state types for the DM Manager bot.
 * These are NOT shared with the DM Manager app.
 */

import type { VoiceConnection } from "@discordjs/voice";

// ============================================================
// Active Recording State
// ============================================================

/**
 * All the information the bot needs to track while recording is active in a guild.
 *
 * One BotRecordingState per Discord server (guild) at most.
 * Stored in GuildStateManager (in-memory Map<guildId, BotRecordingState>).
 */
export interface BotRecordingState {
  /** Discord server this recording belongs to */
  guildId: string;
  /** Voice channel being recorded */
  channelId: string;
  /** DM Manager IDs */
  campaignId: string;
  sessionId: string;
  /** Returned by POST /recordings — used for stop and transcribe calls */
  recordingId: string;
  /** When the recording started (for /status and duration calculation) */
  startedAt: Date;
  /** Active Discord voice connection */
  voiceConnection: VoiceConnection;
  /**
   * Audio chunks accumulating per speaker while recording is active.
   * Key: Discord user ID
   * Value: Array of OGG/Opus Buffer chunks (concatenated on stop)
   *
   * NOTE: In Phase 3 this will be replaced by OpusAccumulator instances
   * that manage the ffmpeg pipe internally. For Phase 1/2 this is a placeholder.
   */
  speakerBuffers: Map<string, Buffer[]>;
}

// ============================================================
// Guild Persistent Settings
// ============================================================

/**
 * Settings persisted to data/guilds.json per guild.
 * Allows /dm-record link to store a default campaign so DMs
 * don't have to type the campaign ID every time.
 */
export interface GuildSettings {
  /** Default campaign ID for /dm-record start (optional) */
  defaultCampaignId?: string;
}

export type GuildSettingsStore = Record<string, GuildSettings>;

// ============================================================
// Command context
// ============================================================

/**
 * Resolved campaign/session IDs for a /start invocation.
 * Either provided explicitly by the user or read from guild settings.
 */
export interface RecordingTarget {
  campaignId: string;
  sessionId: string;
}
