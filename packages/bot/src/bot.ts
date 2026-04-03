/**
 * bot.ts
 *
 * Entry point — initializes the Discord client and registers event handlers.
 *
 * Phase 1: skeleton only. Client connects and logs "Bot ready" to console.
 * Phase 2 will add interaction handlers and slash command routing.
 * Phase 3 will add voice connection and audio capture.
 */

import "dotenv/config";
import { Client, GatewayIntentBits, Events } from "discord.js";

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
// Event handlers
// ============================================================

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[bot] Ready — logged in as ${readyClient.user.tag}`);
  console.log(`[bot] DM_MANAGER_URL = ${process.env.DM_MANAGER_URL ?? "(not set)"}`);
});

// Phase 2: add interactionCreate handler here
// client.on(Events.InteractionCreate, handleInteraction);

// Phase 3: add voiceStateUpdate handler here for late-join speaker detection
// client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);

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
