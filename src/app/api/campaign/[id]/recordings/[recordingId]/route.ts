import { getRecording } from "@/application/useCases/recording";
import { repositories } from "@/infrastructure/config/repositories";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/campaign/[id]/recordings/[recordingId]
 * Returns a recording with its full transcription.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  try {
    const { recordingId } = await params;

    const recording = await getRecording(repositories.recording, recordingId);
    if (!recording) {
      return NextResponse.json(
        { error: "Grabación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(recording);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al obtener grabación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/campaign/[id]/recordings/[recordingId]
 * Deletes a recording.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  try {
    const { recordingId } = await params;

    const recording = await getRecording(repositories.recording, recordingId);
    if (!recording) {
      return NextResponse.json(
        { error: "Grabación no encontrada" },
        { status: 404 }
      );
    }

    await repositories.recording.deleteRecording(recordingId);

    return NextResponse.json({ message: "Grabación eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar grabación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
