import {
  assertNotFinalizada,
  CharacterRef,
  validateCharacterRef,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { CharacterRepository } from "@/domain/character/characterRepository";
import type { SpeakerMapping } from "@/domain/recording/recording";

/**
 * assignCharacter — Assigns a character to a campaign.
 *
 * Steps:
 * 1. Fetch full character from CharacterRepository
 * 2. Fetch campaign
 * 3. Assert campaign is not finalized
 * 4. Build CharacterRef snapshot from full character
 * 5. Validate CharacterRef
 * 6. Check if character already exists in campaign
 * 7. Call campaignRepo.addCharacter
 * 8. Auto-populate discordSpeakerMappings if character has speakerId (additive)
 */
export const assignCharacter = async (
  campaignRepository: CampaignRepository,
  characterRepository: CharacterRepository,
  campaignId: string,
  characterId: string,
  dmDiscordUserId?: string,
  dmDiscordUsername?: string,
): Promise<CharacterRef> => {
  try {
    // Step 1: Fetch full character
    const character = await characterRepository.getCharacterById(characterId);
    if (!character) {
      throw new Error("Personaje no encontrado");
    }

    // Step 2: Fetch campaign
    const campaign = await campaignRepository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 3: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 4: Build CharacterRef snapshot
    const characterRef: CharacterRef = {
      id: character.id,
      name: character.name,
      classType: character.classType,
      level: character.level,
    };

    // Step 5: Validate CharacterRef
    validateCharacterRef(characterRef);

    // Step 6: Check if already exists
    const existingCharacter = campaign.characters.find(c => c.id === characterId);
    if (existingCharacter) {
      throw new Error("El personaje ya está asignado a esta campaña");
    }

    // Step 7: Add to campaign
    const updatedCampaign = await campaignRepository.addCharacter(campaignId, characterRef);
    if (!updatedCampaign) {
      throw new Error("Error al asignar personaje a la campaña");
    }

    // Step 8: Auto-populate speaker mappings (additive — never overwrites existing entries)
    const existingMappings: SpeakerMapping[] = updatedCampaign.discordSpeakerMappings ?? [];
    const existingIds = new Set(existingMappings.map((m) => m.discordUserId));
    const toAdd: SpeakerMapping[] = [];

    if (!character.isNPC && character.speakerId && !existingIds.has(character.speakerId)) {
      const displayName = character.playerAlias ?? character.playerName ?? character.name;
      toAdd.push({
        discordUserId: character.speakerId,
        discordUsername: displayName,
        characterId: character.id,
        characterName: character.name,
        label: displayName,
        role: 'player',
      });
      existingIds.add(character.speakerId);
    }

    const dmId = dmDiscordUserId?.trim();
    if (dmId && !existingIds.has(dmId)) {
      const dmName = dmDiscordUsername?.trim() || 'DM';
      toAdd.push({
        discordUserId: dmId,
        discordUsername: dmName,
        characterId: null,
        characterName: null,
        label: dmName,
        role: 'dm',
      });
    }

    if (toAdd.length > 0) {
      await campaignRepository.setSpeakerMappings(campaignId, [
        ...existingMappings,
        ...toAdd,
      ]);
    }

    return characterRef;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
