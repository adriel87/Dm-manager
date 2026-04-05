import { transferInventoryMoney } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const moneyTransferSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor que 0"),
  type: z.enum(["add", "subtract"]),
});

/**
 * POST /api/campaign/[id]/inventory/money
 * Adds or subtracts money from the campaign inventory.
 * Body: { amount: number, type: "add" | "subtract" }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();
    const { amount, type } = moneyTransferSchema.parse(body);

    const money = await transferInventoryMoney(repositories.campaign, campaignId, amount, type);
    return NextResponse.json({ money });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el dinero";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
