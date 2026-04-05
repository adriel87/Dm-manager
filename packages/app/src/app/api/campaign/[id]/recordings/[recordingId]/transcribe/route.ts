import { transcribeRecording } from "@/application/useCases/recording";
import { repositories } from "@/infrastructure/config/repositories";
import { storageProvider } from "@/infrastructure/config/storage";
import { transcriptionProvider } from "@/infrastructure/config/transcription";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const transcribeBodySchema = z.object({
  language: z.string().optional().default("es"),
});

/**
 * POST /api/campaign/[id]/recordings/[recordingId]/transcribe
 * Triggers transcription for a recording in "processing" or "failed" status.
 * Body: { language?: string }
 *
 * NOTE: For MVP, transcription runs synchronously. The 202 response is
 * aspirational — in practice the handler blocks until transcription completes.
 * Future: move to background job / queue.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  try {
    const { recordingId } = await params;
    const body = await req.json().catch(() => ({}));

    const validated = transcribeBodySchema.parse(body);

    await transcribeRecording(
      repositories.recording,
      storageProvider,
      transcriptionProvider,
      { recordingId, language: validated.language }
    );

    return NextResponse.json(
      { message: "Transcripción completada", recordingId },
      { status: 202 }
    );
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al transcribir grabación";
    const isZodError =
      error !== null &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ZodError";
    return NextResponse.json({ error: message }, { status: isZodError ? 400 : 500 });
  }
}
