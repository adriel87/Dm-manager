import { RecordingI } from "./recording";

/**
 * RecordingRepository — Port for Recording entity persistence.
 * Implementations live in infrastructure/adapters/repositories/.
 */
export interface RecordingRepository {
  getRecordingById(id: string): Promise<RecordingI | null>;
  getRecordingsBySession(
    campaignId: string,
    sessionId: string,
  ): Promise<RecordingI[]>;
  getRecordingsByCampaign(campaignId: string): Promise<RecordingI[]>;
  createRecording(recording: Omit<RecordingI, "id">): Promise<RecordingI>;
  updateRecording(recording: RecordingI): Promise<RecordingI | null>;
  deleteRecording(id: string): Promise<boolean>;
}
