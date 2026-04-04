/**
 * status.ts
 *
 * /dm-record status
 *
 * Shows whether a recording is currently active in this guild.
 *
 * Pattern: Functional Core + Imperative Shell
 */

import type { ChatInputCommandInteraction } from 'discord.js'
import type { BotRecordingState } from '../../types/bot.js'
import type { GuildStateManager } from '../../state/GuildStateManager.js'

// ============================================================
// Result types
// ============================================================

export type StatusResult =
  | { ok: true; status: 'idle' }
  | {
      ok: true
      status: 'recording'
      campaignId: string
      sessionId: string
      recordingId: string
      startedAt: Date
      speakerCount: number
    }

// ============================================================
// Core (pure, testable)
// ============================================================

export function resolveStatusCommand(state: BotRecordingState | undefined): StatusResult {
  if (!state) {
    return { ok: true, status: 'idle' }
  }

  return {
    ok: true,
    status: 'recording',
    campaignId: state.campaignId,
    sessionId: state.sessionId,
    recordingId: state.recordingId,
    startedAt: state.startedAt,
    speakerCount: state.speakerBuffers.size,
  }
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

export async function handleStatus(
  interaction: ChatInputCommandInteraction,
  state: GuildStateManager
): Promise<void> {
  const recordingState = state.get(interaction.guildId!)
  const result = resolveStatusCommand(recordingState)

  if (result.status === 'idle') {
    await interaction.reply({ content: '⏸️ No hay ninguna grabación activa.', ephemeral: true })
    return
  }

  const elapsed = Math.floor((Date.now() - result.startedAt.getTime()) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  await interaction.reply({
    content: [
      '🔴 **Grabando**',
      `📁 Campaña: \`${result.campaignId}\``,
      `🎯 Sesión: \`${result.sessionId}\``,
      `🎙️ Speakers: ${result.speakerCount}`,
      `⏱️ Duración: ${minutes}m ${seconds}s`,
    ].join('\n'),
    ephemeral: true,
  })
}
