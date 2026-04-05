import { updateInventoryItem, removeInventoryItem } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { embeddedItemSchema } from "@/infrastructure/adapters/schemas/campaign.schema";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/campaign/[id]/inventory/[itemId]
 * Updates an existing inventory item.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: campaignId, itemId } = await params;
    const body = await req.json();
    const validatedItem = embeddedItemSchema.parse(body);

    const item = await updateInventoryItem(repositories.campaign, campaignId, {
      ...validatedItem,
      id: itemId,
    });
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el objeto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/campaign/[id]/inventory/[itemId]
 * Removes an item from the campaign's inventory.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: campaignId, itemId } = await params;
    await removeInventoryItem(repositories.campaign, campaignId, itemId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el objeto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
