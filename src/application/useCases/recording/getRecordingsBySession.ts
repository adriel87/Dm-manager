import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";

/**
 * getRecordingsBySession — Returns all recordings for a given campaign session.
 */
export const getRecordingsBySession = async (
  recordingRepository: RecordingRepository,
  campaignId: string,
  sessionId: string
): Promise<RecordingI[]> => {
  return recordingRepository.getRecordingsBySession(campaignId, sessionId);
};
