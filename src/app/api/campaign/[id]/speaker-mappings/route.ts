import {
  getCampaignById,
  setSpeakerMappings,
} from "@/application/useCases/campaign";
import { repositories } from "@/infrastructure/config/repositories";
import { speakerMappingSchema } from "@/infrastructure/adapters/schemas/recording.schema";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/speaker-mappings
 * Returns the current Discord speaker mappings for a campaign.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;

    const campaign = await getCampaignById(repositories.campaign, campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign.discordSpeakerMappings ?? []);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener speaker mappings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/campaign/[id]/speaker-mappings
 * Replaces the full speaker mappings array for a campaign.
 * Body: SpeakerMapping[]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await req.json();

    const validated = z.array(speakerMappingSchema).parse(body);

    const updated = await setSpeakerMappings(
      repositories.campaign,
      campaignId,
      validated
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated.discordSpeakerMappings ?? []);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar speaker mappings";
    const isZodError =
      error !== null &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ZodError";
    return NextResponse.json({ error: message }, { status: isZodError ? 400 : 500 });
  }
}
