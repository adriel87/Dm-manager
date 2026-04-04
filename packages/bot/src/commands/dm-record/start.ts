/**
 * start.ts
 *
 * /dm-record start [campaign-id:<id>] [session-id:<id>]
 *
 * Phase 3: validates inputs, joins voice channel, starts RecordingSession,
 * and calls client.startRecording() to register the recording in DM Manager.
 *
 * Pattern: Functional Core + Imperative Shell
 */

import type { ChatInputCommandInteraction } from 'discord.js'
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice'
import type { GuildStateManager } from '../../state/GuildStateManager.js'
import type { DmManagerClient } from '../../types/client.js'
import { RecordingSession } from '../../audio/RecordingSession.js'

// ============================================================
// Input / Result types
// ============================================================

export interface StartCommandOpts {
  sessionId: string
  campaignIdOption: string | null
  defaultCampaignId: string | undefined
  hasVoiceChannel: boolean
  isAlreadyRecording: boolean
}

export type StartResult =
  | { ok: true; campaignId: string; sessionId: string }
  | { ok: false; error: string }

// ============================================================
// Core (pure, testable)
// ============================================================

export function resolveStartCommand(opts: StartCommandOpts): StartResult {
  const { sessionId, campaignIdOption, defaultCampaignId, hasVoiceChannel, isAlreadyRecording } = opts

  if (!hasVoiceChannel) {
    return { ok: false, error: 'You must be in a voice channel to start a recording.' }
  }

  if (isAlreadyRecording) {
    return { ok: false, error: 'A recording is already active in this server. Use /dm-record stop first.' }
  }

  const campaignId = campaignIdOption ?? defaultCampaignId
  if (!campaignId) {
    return {
      ok: false,
      error:
        'No campaign found. Use /dm-record link to save a default campaign, or pass campaign-id explicitly.',
    }
  }

  return { ok: true, campaignId, sessionId }
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

export async function handleStart(
  interaction: ChatInputCommandInteraction,
  state: GuildStateManager,
  _client: DmManagerClient
): Promise<void> {
  const guildId = interaction.guildId!

  // interaction.guild puede ser null si el guild no está en el cache del cliente todavía.
  // Usamos guilds.fetch() como fallback para garantizar que tenemos el Guild object.
  // Luego accedemos a voiceStates (requiere GuildVoiceStates intent) en vez de members.cache,
  // ya que members.cache no garantiza tener el GuildMember completo con voz.
  const guild = interaction.guild ?? await interaction.client.guilds.fetch(guildId)
  const voiceState = guild.voiceStates.cache.get(interaction.user.id)
    ?? await guild.voiceStates.fetch(interaction.user.id).catch(() => null)
  const voiceChannel = voiceState?.channel ?? null

  const sessionId =
    interaction.options.getString('session-id') ??
    `session-${Date.now()}`

  const result = resolveStartCommand({
    sessionId,
    campaignIdOption: interaction.options.getString('campaign-id'),
    defaultCampaignId: state.getDefaultCampaign(guildId),
    hasVoiceChannel: voiceChannel !== null,
    isAlreadyRecording: state.has(guildId),
  })

  if (!result.ok) {
    await interaction.reply({ content: result.error, ephemeral: true })
    return
  }

  // Phase 3: join voice channel, register recording, start audio capture
  await interaction.deferReply({ ephemeral: true })

  try {
    // Join voice channel
    const voiceConnection = joinVoiceChannel({
      channelId: voiceChannel!.id,
      guildId: guildId,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true,
    })

    // Wait until connected (timeout: 30s)
    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000)

    // Register recording with DM Manager API
    const recording = await _client.startRecording(result.campaignId, {
      sessionId: result.sessionId,
      discordGuildId: guildId,
      discordChannelId: voiceChannel!.id,
    })

    // Start audio capture session
    const recordingSession = new RecordingSession(voiceConnection)
    recordingSession.start()

    // Persist state so stop/status commands can access it
    state.set(guildId, {
      guildId,
      channelId: voiceChannel!.id,
      campaignId: result.campaignId,
      sessionId: result.sessionId,
      recordingId: recording.id,
      startedAt: new Date(),
      voiceConnection,
      speakerBuffers: new Map(),
    })

    // Store the recordingSession on the connection for stop command access
    ;(voiceConnection as unknown as Record<string, unknown>).__recordingSession = recordingSession

    await interaction.editReply({
      content: [
        '🎙️ **Grabación iniciada**',
        `📁 Campaña: \`${result.campaignId}\``,
        `🎯 Sesión: \`${result.sessionId}\``,
        `🆔 Recording: \`${recording.id}\``,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[start] Error starting recording:', err)
    await interaction.editReply({
      content: `❌ Error al iniciar la grabación: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
