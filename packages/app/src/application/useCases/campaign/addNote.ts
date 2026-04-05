import { randomUUID } from "crypto";
import {
  assertNotFinalizada,
  EmbeddedNote,
  validateEmbeddedNote,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

/**
 * addNote — Adds a new note to a campaign's notes array.
 * 
 * Steps:
 * 1. Fetch campaign
 * 2. Assert campaign is not finalized
 * 3. Build note with generated UUID and createdAt
 * 4. Validate note data
 * 5. Call repository.addNote
 */
export const addNote = async (
  repository: CampaignRepository,
  campaignId: string,
  noteData: Omit<EmbeddedNote, "id" | "createdAt">
): Promise<EmbeddedNote> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await repository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 2: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 3: Build note with generated fields
    const note: EmbeddedNote = {
      ...noteData,
      id: randomUUID(),
      createdAt: new Date(),
    };

    // Step 4: Validate
    validateEmbeddedNote(note);

    // Step 5: Add to repository
    const updatedCampaign = await repository.addNote(campaignId, note);
    if (!updatedCampaign) {
      throw new Error("Error al añadir nota a la campaña");
    }

    return note;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
