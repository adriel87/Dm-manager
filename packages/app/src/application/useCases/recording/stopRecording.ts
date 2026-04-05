import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";
import { StorageProvider } from "@/domain/recording/StorageProvider";

/**
 * stopRecording — Stops an active recording, uploads audio buffers to storage,
 * and transitions status to "processing".
 *
 * Steps:
 * 1. Fetch recording, throw if not found
 * 2. Verify status is "recording"
 * 3. Save each speaker audio buffer via storageProvider
 * 4. Build audioFilePath (recording directory)
 * 5. Update recording: status "processing", stoppedAt, audioFilePath, durationSeconds
 */
export const stopRecording = async (
  recordingRepository: RecordingRepository,
  storageProvider: StorageProvider,
  data: {
    recordingId: string;
    audioData: Map<string, Buffer>;
    durationSeconds?: number;
  }
): Promise<RecordingI> => {
  try {
    // Step 1: Fetch recording
    const recording = await recordingRepository.getRecordingById(data.recordingId);
    if (!recording) {
      throw new Error("Grabación no encontrada");
    }

    // Step 2: Verify status
    if (recording.status !== "recording") {
      throw new Error(
        `No se puede detener una grabación en estado "${recording.status}". Estado requerido: "recording"`
      );
    }

    // Step 3: Save each audio buffer
    const { campaignId, sessionId } = recording;
    const recordingDir = `${campaignId}/${sessionId}/${recording.id}`;

    for (const [speakerId, buffer] of data.audioData.entries()) {
      const key = `${recordingDir}/${speakerId}.opus`;
      await storageProvider.save(key, buffer);
    }

    // Step 4: audioFilePath = recording directory
    const audioFilePath = recordingDir;

    // Step 5: Update recording
    const updated: RecordingI = {
      ...recording,
      status: "processing",
      stoppedAt: new Date(),
      audioFilePath,
      durationSeconds: data.durationSeconds ?? null,
      updatedAt: new Date(),
    };

    const result = await recordingRepository.updateRecording(updated);
    if (!result) {
      throw new Error("Error al actualizar la grabación");
    }

    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
