import { addInventoryItem, getInventory } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { embeddedItemSchema } from "@/infrastructure/adapters/schemas/campaign.schema";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/inventory
 * Returns the full inventory (items, capacity, money) for a campaign.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const inventory = await getInventory(repositories.campaign, campaignId);
    return NextResponse.json(inventory);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener el inventario";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * POST /api/campaign/[id]/inventory
 * Adds a new item to the campaign's inventory.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();
    const validatedItem = embeddedItemSchema.parse(body);

    const item = await addInventoryItem(repositories.campaign, campaignId, validatedItem);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al añadir objeto al inventario";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
