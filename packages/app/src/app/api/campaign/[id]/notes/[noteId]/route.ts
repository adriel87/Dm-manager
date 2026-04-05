import { removeNote } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/campaign/[id]/notes/[noteId]
 * Removes a note from a campaign.
 * 
 * Response: 200 + { message: "Nota eliminada exitosamente" }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: campaignId, noteId } = await params;
    
    await removeNote(repositories.campaign, campaignId, noteId);
    
    return NextResponse.json({ message: "Nota eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al eliminar nota";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
