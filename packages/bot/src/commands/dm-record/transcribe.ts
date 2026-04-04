/**
 * transcribe.ts
 *
 * /dm-record transcribe [language:<code>]
 *
 * Triggers transcription of the most recent stopped recording,
 * polls until complete, and posts the transcript.
 *
 * Pattern: Functional Core + Imperative Shell
 */

import type { ChatInputCommandInteraction } from 'discord.js'
import type { BotRecordingState, StoppedRecording } from '../../types/bot.js'
import type { GuildStateManager } from '../../state/GuildStateManager.js'
import type { DmManagerClient } from '../../types/client.js'
import { pollUntilTranscribed } from '../../audio/poller.js'
import { formatTranscriptForDiscord } from '../../audio/transcript.js'

// ============================================================
// Input / Result types
// ============================================================

export interface TranscribeCommandOpts {
  activeState: BotRecordingState | undefined
  lastStopped: StoppedRecording | undefined
  language: string | null
}

export type TranscribeResult =
  | { ok: true; campaignId: string; recordingId: string; language: string }
  | { ok: false; error: string }

// ============================================================
// Core (pure, testable)
// ============================================================

export function resolveTranscribeCommand(opts: TranscribeCommandOpts): TranscribeResult {
  const { activeState, lastStopped, language } = opts

  if (activeState) {
    return {
      ok: false,
      error: 'Hay una grabación activa. Detén la grabación primero con /dm-record stop.',
    }
  }

  if (lastStopped) {
    return {
      ok: true,
      campaignId: lastStopped.campaignId,
      recordingId: lastStopped.recordingId,
      language: language ?? 'es',
    }
  }

  return {
    ok: false,
    error:
      'No hay ninguna grabación reciente. Inicia y detén una grabación primero con /dm-record start y /dm-record stop.',
  }
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

export async function handleTranscribe(
  interaction: ChatInputCommandInteraction,
  state: GuildStateManager,
  client: DmManagerClient
): Promise<void> {
  const guildId = interaction.guildId!
  const language = interaction.options.getString('language')
  const result = resolveTranscribeCommand({
    activeState: state.get(guildId),
    lastStopped: state.getLastStopped(guildId),
    language,
  })

  if (!result.ok) {
    await interaction.reply({ content: result.error, ephemeral: true })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    // Trigger transcription
    await client.transcribeRecording(result.campaignId, result.recordingId, {
      language: result.language,
    })

    // Poll until transcribed or failed
    const pollResult = await pollUntilTranscribed({
      campaignId: result.campaignId,
      recordingId: result.recordingId,
      client,
      intervalMs: 3000,
    })

    if (pollResult.ok) {
      const transcript = formatTranscriptForDiscord(
        pollResult.recording.transcription ?? []
      )
      await interaction.editReply(
        `✅ **Transcripción completada** (\`${result.recordingId}\`)\n\n${transcript}`
      )
    } else {
      await interaction.editReply(
        `❌ Error en la transcripción: ${pollResult.error}`
      )
    }
  } catch (err) {
    await interaction.editReply(
      `❌ Error al transcribir: ${err instanceof Error ? err.message : String(err)}`
    )
  } finally {
    state.clearLastStopped(guildId)
  }
}
