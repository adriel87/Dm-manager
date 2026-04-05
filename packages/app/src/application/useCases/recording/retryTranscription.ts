import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";
import { StorageProvider } from "@/domain/recording/StorageProvider";
import { TranscriptionProviderPort } from "@/domain/recording/TranscriptionProvider";
import { transcribeRecording } from "./transcribeRecording";

/**
 * retryTranscription — Retries transcription on a recording that previously failed.
 *
 * Steps:
 * 1. Fetch recording, throw if not found
 * 2. Verify status is "failed"
 * 3. Clear transcriptionError and set status back to "processing"
 * 4. Delegate to transcribeRecording
 */
export const retryTranscription = async (
  recordingRepository: RecordingRepository,
  storageProvider: StorageProvider,
  transcriptionProvider: TranscriptionProviderPort,
  data: { recordingId: string; language?: string }
): Promise<RecordingI> => {
  try {
    // Step 1: Fetch recording
    const recording = await recordingRepository.getRecordingById(data.recordingId);
    if (!recording) {
      throw new Error("Grabación no encontrada");
    }

    // Step 2: Verify status
    if (recording.status !== "failed") {
      throw new Error(
        `Solo se puede reintentar una grabación en estado "failed". Estado actual: "${recording.status}"`
      );
    }

    // Step 3: Clear error and reset to "processing"
    const reset: RecordingI = {
      ...recording,
      status: "processing",
      transcriptionError: null,
      updatedAt: new Date(),
    };

    const updated = await recordingRepository.updateRecording(reset);
    if (!updated) {
      throw new Error("Error al restablecer el estado de la grabación");
    }

    // Step 4: Delegate to transcribeRecording
    return transcribeRecording(
      recordingRepository,
      storageProvider,
      transcriptionProvider,
      data
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
