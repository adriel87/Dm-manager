import {
  assertNotFinalizada,
  CharacterRef,
  validateCharacterRef,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { CharacterRepository } from "@/domain/character/characterRepository";

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
 */
export const assignCharacter = async (
  campaignRepository: CampaignRepository,
  characterRepository: CharacterRepository,
  campaignId: string,
  characterId: string
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

    return characterRef;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
