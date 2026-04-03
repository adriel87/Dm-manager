import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const removeInventoryItem = async (
  repository: CampaignRepository,
  campaignId: string,
  itemId: string
): Promise<void> => {
  const campaign = await repository.getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaña no encontrada");

  assertNotFinalizada(campaign);

  const exists = campaign.inventory.items.some((i) => i.id === itemId);
  if (!exists) throw new Error("Objeto no encontrado en el inventario");

  const updated = await repository.removeInventoryItem(campaignId, itemId);
  if (!updated) throw new Error("Error al eliminar el objeto del inventario");
};
