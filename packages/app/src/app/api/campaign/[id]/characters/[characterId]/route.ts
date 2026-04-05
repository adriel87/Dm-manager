import { removeCharacter } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/campaign/[id]/characters/[characterId]
 * Removes a character reference from a campaign
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: campaignId, characterId } = await params;
    
    await removeCharacter(repositories.campaign, campaignId, characterId);
    
    return NextResponse.json({ message: "Personaje removido exitosamente" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al remover personaje";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
