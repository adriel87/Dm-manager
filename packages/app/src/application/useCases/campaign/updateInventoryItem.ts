import {
  assertNotFinalizada,
  EmbeddedItem,
  validateEmbeddedItem,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const updateInventoryItem = async (
  repository: CampaignRepository,
  campaignId: string,
  item: EmbeddedItem
): Promise<EmbeddedItem> => {
  const campaign = await repository.getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaña no encontrada");

  assertNotFinalizada(campaign);

  const exists = campaign.inventory.items.some((i) => i.id === item.id);
  if (!exists) throw new Error("Objeto no encontrado en el inventario");

  validateEmbeddedItem(item);

  const updated = await repository.updateInventoryItem(campaignId, item);
  if (!updated) throw new Error("Error al actualizar el objeto del inventario");

  return item;
};
