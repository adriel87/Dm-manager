import { assignGroup, removeGroup, getCampaignById } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/group
 * Returns the group snapshot for a campaign (or 404 if no group assigned)
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
    
    if (!campaign.group) {
      return NextResponse.json({ error: "No hay grupo asignado a esta campaña" }, { status: 404 });
    }
    
    return NextResponse.json(campaign.group);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al obtener grupo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/campaign/[id]/group
 * Assigns a group to a campaign (replaces existing group if any)
 * Body: { groupId: string }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();
    
    const { groupId } = body;
    if (!groupId || typeof groupId !== 'string') {
      return NextResponse.json(
        { error: "groupId es requerido" },
        { status: 400 }
      );
    }
    
    // assignGroup fetches full group from GroupRepository and creates snapshot
    const groupSnapshot = await assignGroup(
      repositories.campaign,
      repositories.group,
      campaignId,
      groupId,
      process.env.NEXT_PUBLIC_DM_DISCORD_USER_ID,
      process.env.NEXT_PUBLIC_DM_DISCORD_USERNAME,
    );
    
    return NextResponse.json(groupSnapshot);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al asignar grupo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/campaign/[id]/group
 * Removes the group from a campaign (sets to null)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    
    await removeGroup(repositories.campaign, campaignId);
    
    return NextResponse.json({ message: "Grupo removido exitosamente" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al remover grupo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
