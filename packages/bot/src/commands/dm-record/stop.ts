/**
 * stop.ts
 *
 * /dm-record stop
 *
 * Phase 3: stops the active RecordingSession, collects audio buffers,
 * sends them to DM Manager via client.stopRecording(), and disconnects.
 *
 * Pattern: Functional Core + Imperative Shell
 */

import type { ChatInputCommandInteraction } from 'discord.js'
import type { BotRecordingState } from '../../types/bot.js'
import type { GuildStateManager } from '../../state/GuildStateManager.js'
import type { DmManagerClient } from '../../types/client.js'
import type { RecordingSession } from '../../audio/RecordingSession.js'

// ============================================================
// Result types
// ============================================================

export type StopResult =
  | { ok: true; campaignId: string; recordingId: string }
  | { ok: false; error: string }

// ============================================================
// Core (pure, testable)
// ============================================================

export function resolveStopCommand(state: BotRecordingState | undefined): StopResult {
  if (!state) {
    return { ok: false, error: 'No hay ninguna grabación activa en este servidor.' }
  }

  return {
    ok: true,
    campaignId: state.campaignId,
    recordingId: state.recordingId,
  }
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

export async function handleStop(
  interaction: ChatInputCommandInteraction,
  state: GuildStateManager,
  _client: DmManagerClient
): Promise<void> {
  const guildId = interaction.guildId!
  const result = resolveStopCommand(state.get(guildId))

  if (!result.ok) {
    await interaction.reply({ content: result.error, ephemeral: true })
    return
  }

  // Phase 3: collect audio, stop connection, upload to DM Manager
  await interaction.deferReply({ ephemeral: true })

  const currentState = state.get(guildId)!

  // Retrieve the RecordingSession attached to the voice connection
  const recordingSession = (
    currentState.voiceConnection as unknown as Record<string, unknown>
  ).__recordingSession as RecordingSession | undefined

  try {
    // Collect audio data from all speakers
    let audioData: Record<string, string> = {}
    if (recordingSession) {
      audioData = await recordingSession.stop()
    }

    const durationSeconds = recordingSession?.getDurationSeconds() ?? 0

    // Disconnect from voice channel
    currentState.voiceConnection.destroy()

    // Remove from in-memory state
    state.delete(guildId)

    // Send audio to DM Manager
    await _client.stopRecording(result.campaignId, result.recordingId, {
      durationSeconds,
      audioData,
    })

    // Persist stopped recording info so /dm-record transcribe can pick it up
    state.setLastStopped(guildId, {
      campaignId: result.campaignId,
      recordingId: result.recordingId,
      stoppedAt: new Date(),
    })

    const speakerCount = Object.keys(audioData).length

    await interaction.editReply({
      content: [
        '⏹️ **Grabación detenida**',
        `🆔 Recording: \`${result.recordingId}\``,
        `👥 Speakers capturados: ${speakerCount}`,
        `⏱️ Duración: ${durationSeconds}s`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[stop] Error stopping recording:', err)
    // Still clean up state even on error
    try { currentState.voiceConnection.destroy() } catch { /* ignore */ }
    state.delete(guildId)

    await interaction.editReply({
      content: `❌ Error al detener la grabación: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
