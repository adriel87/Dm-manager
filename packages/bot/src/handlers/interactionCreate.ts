/**
 * interactionCreate.ts
 *
 * Routes incoming Discord interactions to the correct /dm-record subcommand handler.
 *
 * Only ChatInputCommandInteraction for the 'dm-record' command is handled.
 * Everything else is ignored silently.
 */

import type { Interaction } from 'discord.js'
import type { GuildStateManager } from '../state/GuildStateManager.js'
import type { DmManagerClient } from '../types/client.js'
import { handleLink } from '../commands/dm-record/link.js'
import { handleStatus } from '../commands/dm-record/status.js'
import { handleStart } from '../commands/dm-record/start.js'
import { handleStop } from '../commands/dm-record/stop.js'
import { handleTranscribe } from '../commands/dm-record/transcribe.js'
import { handleAutocomplete } from '../commands/dm-record/autocomplete.js'

export async function handleInteraction(
  interaction: Interaction,
  state: GuildStateManager,
  client: DmManagerClient
): Promise<void> {
  // Handle autocomplete before ChatInputCommand check
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === 'dm-record') {
      await handleAutocomplete(interaction, client)
    }
    return
  }

  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== 'dm-record') return

  const subcommand = interaction.options.getSubcommand()
  switch (subcommand) {
    case 'link':
      await handleLink(interaction, state)
      break

    case 'status':
      await handleStatus(interaction, state)
      break

    case 'start':
      await handleStart(interaction, state, client)
      break

    case 'stop':
      await handleStop(interaction, state, client)
      break

    case 'transcribe':
      await handleTranscribe(interaction, state, client)
      break

    default:
      await interaction.reply({ content: `Unknown command: \`${subcommand}\``, ephemeral: true })
  }
}
