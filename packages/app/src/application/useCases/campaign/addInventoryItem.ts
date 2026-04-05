import { randomUUID } from "crypto";
import {
  assertNotFinalizada,
  EmbeddedItem,
  validateEmbeddedItem,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const addInventoryItem = async (
  repository: CampaignRepository,
  campaignId: string,
  itemData: Omit<EmbeddedItem, "id">
): Promise<EmbeddedItem> => {
  const campaign = await repository.getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaña no encontrada");

  assertNotFinalizada(campaign);
  validateEmbeddedItem(itemData);

  const item: EmbeddedItem = { ...itemData, id: randomUUID() };

  const updated = await repository.addInventoryItem(campaignId, item);
  if (!updated) throw new Error("Error al añadir objeto al inventario");

  return item;
};
