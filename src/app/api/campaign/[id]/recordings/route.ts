import {
  startRecording,
  getRecordingsBySession,
} from "@/application/useCases/recording";
import { repositories } from "@/infrastructure/config/repositories";
import { startRecordingSchema } from "@/infrastructure/adapters/schemas/recording.schema";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/recordings
 * Returns all recordings for a campaign.
 * Optionally filtered by sessionId via query param: ?sessionId=...
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    let recordings;
    if (sessionId) {
      recordings = await getRecordingsBySession(
        repositories.recording,
        campaignId,
        sessionId
      );
    } else {
      recordings = await repositories.recording.getRecordingsByCampaign(
        campaignId
      );
    }

    return NextResponse.json(recordings);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al obtener grabaciones";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/campaign/[id]/recordings
 * Starts a new recording for a campaign session (called by Discord bot).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();

    const validated = startRecordingSchema.parse(body);

    const created = await startRecording(
      repositories.recording,
      repositories.campaign,
      {
        campaignId,
        sessionId: validated.sessionId,
        discordGuildId: validated.discordGuildId,
        discordChannelId: validated.discordChannelId,
      }
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al iniciar grabación";
    const isZodError =
      error !== null &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ZodError";
    return NextResponse.json({ error: message }, { status: isZodError ? 400 : 500 });
  }
}
