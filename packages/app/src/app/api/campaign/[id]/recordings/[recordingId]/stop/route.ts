import { stopRecording } from "@/application/useCases/recording";
import { repositories } from "@/infrastructure/config/repositories";
import { storageProvider } from "@/infrastructure/config/storage";
import { stopRecordingSchema } from "@/infrastructure/adapters/schemas/recording.schema";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const stopBodySchema = stopRecordingSchema.extend({
  audioData: z
    .record(z.string(), z.string())
    .describe("Map of discordUserId to base64-encoded audio buffer"),
});

/**
 * PUT /api/campaign/[id]/recordings/[recordingId]/stop
 * Stops an active recording and uploads per-speaker audio buffers to storage.
 * Body: { audioData: { [discordUserId]: base64String }, durationSeconds?: number }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  try {
    const { recordingId } = await params;
    const body = await req.json();

    const validated = stopBodySchema.parse(body);

    // Convert base64 strings to Buffers
    const audioData = new Map<string, Buffer>();
    for (const [speakerId, base64] of Object.entries(validated.audioData)) {
      audioData.set(speakerId, Buffer.from(base64, "base64"));
    }

    const updated = await stopRecording(repositories.recording, storageProvider, {
      recordingId,
      audioData,
      durationSeconds: validated.durationSeconds,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al detener grabación";
    const isZodError =
      error !== null &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ZodError";
    return NextResponse.json({ error: message }, { status: isZodError ? 400 : 500 });
  }
}
