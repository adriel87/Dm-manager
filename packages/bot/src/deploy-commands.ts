/**
 * deploy-commands.ts
 *
 * One-shot script to register slash commands with Discord.
 * Run this once after bot setup, and again whenever you add/change commands.
 *
 * Usage:
 *   npm run deploy-commands        # from packages/bot/
 *
 * Two modes:
 * - Guild-scoped (DISCORD_GUILD_ID set): registers instantly, only visible in that server.
 *   Use this during development.
 * - Global (no DISCORD_GUILD_ID): takes up to 1 hour to propagate to all servers.
 *   Use this for production.
 */

import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

// ============================================================
// Command definitions
// ============================================================

/**
 * All 5 slash commands for the bot, defined as a flat /dm-record subcommand group.
 *
 * Discord slash commands support one level of subcommands natively.
 * All bot actions live under /dm-record to keep the command namespace clean.
 */
const dmRecordCommand = new SlashCommandBuilder()
  .setName("dm-record")
  .setDescription("DM Manager recording commands")

  // /dm-record start — begins recording in the caller's voice channel
  .addSubcommand((sub) =>
    sub
      .setName("start")
      .setDescription("Join voice channel and start recording the session")
      .addStringOption((opt) =>
        opt
          .setName("session-id")
          .setDescription("Session ID from DM Manager (visible in the session list URL)")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("campaign-id")
          .setDescription("Campaign ID (optional if /dm-record link was used)")
          .setRequired(false)
      )
  )

  // /dm-record stop — stops the active recording and uploads audio to DM Manager
  .addSubcommand((sub) =>
    sub
      .setName("stop")
      .setDescription("Stop recording and upload audio to DM Manager")
  )

  // /dm-record transcribe — triggers Whisper transcription on the last stopped recording
  .addSubcommand((sub) =>
    sub
      .setName("transcribe")
      .setDescription("Transcribe the last stopped recording")
      .addStringOption((opt) =>
        opt
          .setName("language")
          .setDescription('Language of the recording (default: "es"). BCP-47 code e.g. "en", "es", "fr"')
          .setRequired(false)
      )
  )

  // /dm-record status — shows what is currently being recorded
  .addSubcommand((sub) =>
    sub
      .setName("status")
      .setDescription("Show current recording status in this server")
  )

  // /dm-record link — saves a default campaign ID so you don't have to type it every time
  .addSubcommand((sub) =>
    sub
      .setName("link")
      .setDescription("Save a default campaign for this server")
      .addStringOption((opt) =>
        opt
          .setName("campaign-id")
          .setDescription("Campaign ID to use as default for /dm-record start")
          .setRequired(true)
      )
  );

const commands = [dmRecordCommand.toJSON()];

// ============================================================
// Registration
// ============================================================

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID; // optional

if (!token || !clientId) {
  console.error("DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env");
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash command(s)...`);

    if (guildId) {
      // Guild-scoped — instant, use during development
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log(`Commands registered in guild ${guildId} (instant)`);
    } else {
      // Global — propagates in ~1h, use for production
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log("Commands registered globally (may take up to 1 hour to appear)");
    }
  } catch (err) {
    console.error("Failed to register commands:", err);
    process.exit(1);
  }
})();
