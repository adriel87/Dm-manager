/**
 * client.ts
 *
 * Interface for the DM Manager HTTP client as seen by command handlers.
 * This is a subset of the functions exported from api/dm-manager.client.ts,
 * defined as an interface so handlers can be tested without real HTTP calls.
 */

import type {
  StartRecordingInput,
  StartRecordingResponse,
  StopRecordingInput,
  StopRecordingResponse,
  TranscribeRecordingInput,
  TranscribeRecordingResponse,
  GetRecordingsResponse,
  GetCampaignsResponse,
} from './dm-manager.js'

export interface DmManagerClient {
  startRecording(campaignId: string, input: StartRecordingInput): Promise<StartRecordingResponse>
  stopRecording(campaignId: string, recordingId: string, input: StopRecordingInput): Promise<StopRecordingResponse>
  transcribeRecording(campaignId: string, recordingId: string, input?: TranscribeRecordingInput): Promise<TranscribeRecordingResponse>
  getRecordings(campaignId: string, sessionId?: string): Promise<GetRecordingsResponse>
  getCampaigns(): Promise<GetCampaignsResponse>
}
