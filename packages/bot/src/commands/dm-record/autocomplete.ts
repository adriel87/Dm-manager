/**
 * autocomplete.ts
 *
 * /dm-record start campaign-id autocomplete handler.
 *
 * Pattern: Functional Core + Imperative Shell
 * - resolveAutocomplete: pure, testable — filters and ranks campaign choices
 * - handleAutocomplete: shell — reads interaction, calls API, responds to Discord
 */

import type { AutocompleteInteraction } from 'discord.js'
import type { Campaign } from '../../types/dm-manager.js'
import type { DmManagerClient } from '../../types/client.js'

// ============================================================
// Types
// ============================================================

export interface CampaignChoice {
  /** Display name shown in the autocomplete dropdown */
  name: string
  /** Value inserted into the option (the campaign ID) */
  value: string
}

// ============================================================
// Core (pure, testable)
// ============================================================

/**
 * Filters and ranks campaigns for the autocomplete dropdown.
 *
 * Matching rules (OR):
 * - campaign.name contains focusedValue (case-insensitive)
 * - campaign.id starts with focusedValue (case-insensitive)
 *
 * If focusedValue is empty, all campaigns are returned.
 * Results are limited to 25 (Discord's hard cap).
 * Name matches are ordered before id-only matches.
 */
export function resolveAutocomplete(
  campaigns: Campaign[],
  focusedValue: string
): CampaignChoice[] {
  const query = focusedValue.toLowerCase()

  // Separate into name matches and id-only matches so name matches sort first
  const nameMatches: CampaignChoice[] = []
  const idMatches: CampaignChoice[] = []

  for (const campaign of campaigns) {
    const nameMatch = campaign.name.toLowerCase().includes(query)
    const idMatch = campaign.id.toLowerCase().startsWith(query)

    if (query === '' || nameMatch) {
      nameMatches.push({ name: campaign.name, value: campaign.id })
    } else if (idMatch) {
      idMatches.push({ name: campaign.name, value: campaign.id })
    }
  }

  return [...nameMatches, ...idMatches].slice(0, 25)
}

// ============================================================
// Shell (Discord — not unit tested)
// ============================================================

/**
 * Handles an AutocompleteInteraction for the campaign-id option.
 * Never throws — if anything fails, responds with an empty list so Discord
 * doesn't show an error to the user.
 */
export async function handleAutocomplete(
  interaction: AutocompleteInteraction,
  client: DmManagerClient
): Promise<void> {
  const focusedValue = interaction.options.getFocused()

  let campaigns: Campaign[] = []
  try {
    campaigns = await client.getCampaigns()
  } catch {
    // Silently fall through — respond with empty list below
  }

  const choices = resolveAutocomplete(campaigns, String(focusedValue))
  await interaction.respond(choices)
}
