/**
 * bot.ts
 *
 * Entry point — initializes the Discord client and registers event handlers.
 *
 * Phase 1: skeleton only. Client connects and logs "Bot ready" to console.
 * Phase 2: adds interaction handlers, slash command routing, guild state management.
 * Phase 3 will add voice connection and audio capture.
 */

import "dotenv/config";
import { join } from "path";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { GuildStateManager } from "./state/GuildStateManager.js";
import { BotDatabase } from "./state/BotDatabase.js";
import { handleInteraction } from "./handlers/interactionCreate.js";
import { handleVoiceStateUpdate } from "./handlers/voiceStateUpdate.js";
import * as dmManagerClient from "./api/dm-manager.client.js";
import type { DmManagerClient } from "./types/client.js";

// ============================================================
// Client setup
// ============================================================

/**
 * GatewayIntentBits are opt-in permissions that tell Discord which events
 * the bot wants to receive. Only request what you actually need.
 *
 * - Guilds: required for basic server access (channels, roles, etc.)
 * - GuildVoiceStates: required to see when users join/leave/mute in voice channels
 *   (needed for @discordjs/voice to function and for late-join detection)
 * - GuildMessages: used to receive message events (optional for this bot)
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ============================================================
// State
// ============================================================

const db = new BotDatabase(join(process.cwd(), 'data', 'bot.db'));
const state = new GuildStateManager(db);

// Adapt the module exports to the DmManagerClient interface
const apiClient: DmManagerClient = {
  startRecording: dmManagerClient.startRecording,
  stopRecording: dmManagerClient.stopRecording,
  transcribeRecording: dmManagerClient.transcribeRecording,
  getRecordings: dmManagerClient.getRecordings,
  getCampaigns: dmManagerClient.getCampaigns,
};

// ============================================================
// Event handlers
// ============================================================

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[bot] Ready — logged in as ${readyClient.user.tag}`);
  console.log(`[bot] DM_MANAGER_URL = ${process.env.DM_MANAGER_URL ?? "(not set)"}`);

  // Load persisted guild settings (default campaign IDs, etc.)
  await state.loadSettings();
  console.log("[bot] Guild settings loaded.");
});

client.on(Events.InteractionCreate, (interaction) => {
  handleInteraction(interaction, state, apiClient).catch((err: unknown) => {
    console.error("[bot] Unhandled error in interactionCreate handler:", err);
  });
});

client.on(Events.VoiceStateUpdate, (oldVoiceState, newVoiceState) => {
  handleVoiceStateUpdate(oldVoiceState, newVoiceState, state).catch((err: unknown) => {
    console.error("[bot] Unhandled error in voiceStateUpdate handler:", err);
  });
});

// ============================================================
// Login
// ============================================================

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("[bot] DISCORD_TOKEN is not set. Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

client.login(token).catch((err: unknown) => {
  console.error("[bot] Failed to login:", err);
  process.exit(1);
});

// ============================================================
// Graceful shutdown
// ============================================================

async function shutdown(signal: string): Promise<void> {
  console.log(`[bot] Received ${signal} — shutting down...`);
  client.destroy();
  db.close();
  console.log("[bot] Shutdown complete.");
  process.exit(0);
}

process.on("SIGTERM", () => { shutdown("SIGTERM").catch(console.error); });
process.on("SIGINT",  () => { shutdown("SIGINT").catch(console.error); });
