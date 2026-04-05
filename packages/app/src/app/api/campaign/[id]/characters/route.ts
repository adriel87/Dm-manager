import { assignCharacter, getCampaignById } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/characters
 * Returns all character references for a campaign
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    
    const campaign = await getCampaignById(repositories.campaign, campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(campaign.characters);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al obtener personajes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * POST /api/campaign/[id]/characters
 * Assigns a character to a campaign (creates CharacterRef snapshot)
 * Body: { characterId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();
    
    const { characterId } = body;
    if (!characterId || typeof characterId !== 'string') {
      return NextResponse.json(
        { error: "characterId es requerido" },
        { status: 400 }
      );
    }
    
    // assignCharacter fetches full character from CharacterRepository and creates snapshot
    const characterRef = await assignCharacter(
      repositories.campaign,
      repositories.character,
      campaignId,
      characterId
    );
    
    return NextResponse.json(characterRef, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al asignar personaje";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
