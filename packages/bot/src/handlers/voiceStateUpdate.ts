/**
 * voiceStateUpdate.ts
 *
 * Handles Discord VoiceStateUpdate events.
 *
 * The only case we care about: the bot itself was disconnected from a voice channel.
 * When that happens we clean up any active recording state so the guild doesn't get
 * stuck in a "recording" state that can never be stopped.
 */

import type { VoiceState } from 'discord.js'
import type { GuildStateManager } from '../state/GuildStateManager.js'

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  guildState: GuildStateManager
): Promise<void> {
  // Only react when the bot was disconnected from a voice channel
  const isBotDisconnected =
    oldState.member?.user.bot === true &&
    oldState.channelId !== null &&
    newState.channelId === null

  if (!isBotDisconnected) return

  const guildId = oldState.guild.id

  if (guildState.has(guildId)) {
    console.warn(
      `[voiceStateUpdate] Bot disconnected from guild ${guildId} while recording was active — cleaning up state`
    )
    guildState.delete(guildId)
  }
}
