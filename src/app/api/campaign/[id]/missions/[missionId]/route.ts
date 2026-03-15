import { updateMission, removeMission, getCampaignById } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { embeddedMissionSchema } from "@/infrastructure/adapters/schemas/campaign.schema";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/missions/[missionId]
 * Returns a specific mission from a campaign
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; missionId: string }> }
) {
  try {
    const { id: campaignId, missionId } = await params;
    
    const campaign = await getCampaignById(repositories.campaign, campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    
    const mission = campaign.missions.find(m => m.id === missionId);
    if (!mission) {
      return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(mission);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al obtener misión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/campaign/[id]/missions/[missionId]
 * Updates a specific mission in a campaign
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; missionId: string }> }
) {
  try {
    const { id: campaignId, missionId } = await params;
    const body = await req.json();
    
    // Validate mission data
    const validatedMission = embeddedMissionSchema.parse(body);
    
    // Call use case with full mission object (including id from URL)
    const updatedMission = await updateMission(
      repositories.campaign,
      campaignId,
      { ...validatedMission, id: missionId }
    );
    
    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al actualizar misión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/campaign/[id]/missions/[missionId]
 * Removes a mission from a campaign
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; missionId: string }> }
) {
  try {
    const { id: campaignId, missionId } = await params;
    
    await removeMission(repositories.campaign, campaignId, missionId);
    
    return NextResponse.json({ message: "Misión eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al eliminar misión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
