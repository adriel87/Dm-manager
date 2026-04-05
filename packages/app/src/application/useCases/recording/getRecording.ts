import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";

/**
 * getRecording — Fetches a single recording by ID.
 * Returns null if not found.
 */
export const getRecording = async (
  recordingRepository: RecordingRepository,
  recordingId: string
): Promise<RecordingI | null> => {
  return recordingRepository.getRecordingById(recordingId);
};
