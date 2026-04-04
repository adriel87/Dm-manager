/**
 * link.ts
 *
 * /dm-record link campaign-id:<id>
 *
 * Links a default campaign to the guild so DMs don't have to type the ID
 * every time they run /dm-record start.
 *
 * Pattern: Functional Core + Imperative Shell
 * - resolveLinkCommand: pure, testable
 * - handleLink: Discord shell (not unit tested)
 */

import type { ChatInputCommandInteraction } from 'discord.js'
import type { GuildStateManager } from '../../state/GuildStateManager.js'

// ============================================================
// Result types
// ============================================================

export type LinkResult =
  | { ok: true; campaignId: string }
  | { ok: false; error: string }

// ============================================================
// Core (pure, testable)
// ============================================================

export function resolveLinkCommand(campaignId: string): LinkResult {
  if (!campaignId.trim()) {
    return { ok: false, error: 'Campaign ID cannot be empty.' }
  }
  return { ok: true, campaignId: campaignId.trim() }
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

export async function handleLink(
  interaction: ChatInputCommandInteraction,
  state: GuildStateManager
): Promise<void> {
  const campaignId = interaction.options.getString('campaign-id', true)
  const result = resolveLinkCommand(campaignId)

  if (!result.ok) {
    await interaction.reply({ content: result.error, ephemeral: true })
    return
  }

  await state.setDefaultCampaign(interaction.guildId!, result.campaignId)
  await interaction.reply({
    content: `✅ Campaña por defecto guardada: \`${result.campaignId}\``,
    ephemeral: true,
  })
}
