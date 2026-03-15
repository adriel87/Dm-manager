import { updateSession, removeSession, getCampaignById } from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { embeddedSessionSchema } from "@/infrastructure/adapters/schemas/campaign.schema";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/sessions/[sessionId]
 * Returns a specific session from a campaign
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: campaignId, sessionId } = await params;
    
    const campaign = await getCampaignById(repositories.campaign, campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    
    const session = campaign.sessions.find(s => s.id === sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al obtener sesión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/campaign/[id]/sessions/[sessionId]
 * Updates a specific session in a campaign
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: campaignId, sessionId } = await params;
    const body = await req.json();
    
    // Get existing session to preserve sessionNumber
    const campaign = await getCampaignById(repositories.campaign, campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    
    const existingSession = campaign.sessions.find(s => s.id === sessionId);
    if (!existingSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    
    // Validate session data (without sessionNumber - use existing)
    const validatedSession = embeddedSessionSchema.parse(body);
    
    // Call use case with full session object (including id and sessionNumber)
    const updatedSession = await updateSession(
      repositories.campaign,
      campaignId,
      { 
        ...validatedSession, 
        id: sessionId,
        sessionNumber: existingSession.sessionNumber // Preserve original sessionNumber
      }
    );
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al actualizar sesión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/campaign/[id]/sessions/[sessionId]
 * Removes a session from a campaign
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: campaignId, sessionId } = await params;
    
    await removeSession(repositories.campaign, campaignId, sessionId);
    
    return NextResponse.json({ message: "Sesión eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al eliminar sesión";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
