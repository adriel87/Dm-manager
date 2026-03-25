import { assertNotFinalizada } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { RecordingI, validateRecording } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";

/**
 * startRecording — Initiates a new recording for an existing campaign session.
 *
 * Steps:
 * 1. Fetch campaign, throw if not found or finalized
 * 2. Verify sessionId exists in campaign.sessions
 * 3. Snapshot speaker mappings from campaign.discordSpeakerMappings
 * 4. Validate recording data
 * 5. Create recording with status "recording"
 */
export const startRecording = async (
  recordingRepository: RecordingRepository,
  campaignRepository: CampaignRepository,
  data: {
    campaignId: string;
    sessionId: string;
    discordGuildId: string;
    discordChannelId: string;
  }
): Promise<RecordingI> => {
  try {
    // Step 1: Fetch campaign
    const campaign = await campaignRepository.getCampaignById(data.campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 1b: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 2: Verify sessionId exists
    const sessionExists = campaign.sessions.some((s) => s.id === data.sessionId);
    if (!sessionExists) {
      throw new Error(
        `Sesión con id "${data.sessionId}" no encontrada en la campaña`
      );
    }

    // Step 3: Snapshot speaker mappings
    const speakers = [...(campaign.discordSpeakerMappings ?? [])];

    // Step 4: Build recording data and validate
    const now = new Date();
    const recordingData: Omit<RecordingI, "id"> = {
      campaignId: data.campaignId,
      sessionId: data.sessionId,
      discordGuildId: data.discordGuildId,
      discordChannelId: data.discordChannelId,
      status: "recording",
      speakers,
      audioFilePath: null,
      durationSeconds: null,
      transcription: null,
      transcriptionProvider: null,
      transcriptionError: null,
      startedAt: now,
      stoppedAt: null,
      transcribedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    validateRecording(recordingData);

    // Step 5: Persist and return
    const created = await recordingRepository.createRecording(recordingData);
    return created;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
