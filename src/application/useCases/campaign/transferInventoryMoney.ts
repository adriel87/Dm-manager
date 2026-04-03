import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export type MoneyTransferType = "add" | "subtract";

export const transferInventoryMoney = async (
  repository: CampaignRepository,
  campaignId: string,
  amount: number,
  type: MoneyTransferType
): Promise<number> => {
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error("El monto debe ser un número mayor que 0");
  }

  const campaign = await repository.getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaña no encontrada");

  assertNotFinalizada(campaign);

  const delta = type === "add" ? amount : -amount;
  const updated = await repository.incrementInventoryMoney(campaignId, delta);
  if (!updated) throw new Error("Error al actualizar el dinero del inventario");

  return updated.inventory.money;
};
