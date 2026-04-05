import { RecordingI, TranscriptionSegment } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";
import { StorageProvider } from "@/domain/recording/StorageProvider";
import { TranscriptionProviderPort } from "@/domain/recording/TranscriptionProvider";

/**
 * transcribeRecording — Loads each speaker's audio from storage, calls the
 * transcription provider, merges segments by startTime, and persists the result.
 *
 * Steps:
 * 1. Fetch recording, throw if not found
 * 2. Verify status is "processing" or "failed"
 * 3. For each speaker: load audio, transcribe, map segments
 * 4. Merge and sort all segments by startTime
 * 5. Update recording: status "transcribed", transcription, transcriptionProvider, transcribedAt
 * 6. On error: mark as "failed" with transcriptionError, then re-throw
 */
export const transcribeRecording = async (
  recordingRepository: RecordingRepository,
  storageProvider: StorageProvider,
  transcriptionProvider: TranscriptionProviderPort,
  data: { recordingId: string; language?: string }
): Promise<RecordingI> => {
  // Step 1: Fetch recording
  const recording = await recordingRepository.getRecordingById(data.recordingId);
  if (!recording) {
    throw new Error("Grabación no encontrada");
  }

  // Step 2: Verify status
  if (recording.status !== "processing" && recording.status !== "failed") {
    throw new Error(
      `No se puede transcribir una grabación en estado "${recording.status}". Estados permitidos: "processing", "failed"`
    );
  }

  try {
    const allSegments: TranscriptionSegment[] = [];

    // Step 3: Transcribe per speaker
    for (const speaker of recording.speakers) {
      const audioKey = `${recording.audioFilePath}/${speaker.discordUserId}.opus`;
      const buffer = await storageProvider.get(audioKey);

      if (!buffer) {
        // Skip speakers with no audio file (they may not have spoken)
        continue;
      }

      const result = await transcriptionProvider.transcribe(buffer, data.language);

      // Map segments: fill in speaker identity
      const speakerSegments: TranscriptionSegment[] = result.segments.map((seg) => ({
        ...seg,
        speakerDiscordUserId: speaker.discordUserId,
        speakerLabel: speaker.label,
      }));

      allSegments.push(...speakerSegments);
    }

    // Step 4: Merge and sort by startTime
    allSegments.sort((a, b) => a.startTime - b.startTime);

    // Step 5: Persist success
    const updated: RecordingI = {
      ...recording,
      status: "transcribed",
      transcription: allSegments,
      transcriptionProvider: transcriptionProvider.name,
      transcriptionError: null,
      transcribedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await recordingRepository.updateRecording(updated);
    if (!result) {
      throw new Error("Error al actualizar la grabación tras la transcripción");
    }

    return result;
  } catch (e) {
    // Step 6: Mark as failed and re-throw
    const errorMessage = e instanceof Error ? e.message : String(e);

    const failed: RecordingI = {
      ...recording,
      status: "failed",
      transcriptionError: errorMessage,
      updatedAt: new Date(),
    };

    await recordingRepository.updateRecording(failed);
    console.error(e);
    throw e;
  }
};
