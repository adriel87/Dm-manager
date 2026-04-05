import { randomUUID } from "crypto";
import { assertNotFinalizada, EmbeddedSession } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { RecordingI, validateRecording } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";

/**
 * startRecording — Initiates a new recording for an existing campaign session.
 *
 * Steps:
 * 1. Fetch campaign, throw if not found or finalized
 * 2. Verify sessionId exists in campaign.sessions.
 *    If not found, auto-create a new session with sensible defaults
 *    so the bot can always link a recording to a session.
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

    // Step 2: Verify sessionId exists, or auto-create a session if not found.
    // This allows the Discord bot to start a recording without requiring a
    // pre-existing session — the session will be created on the fly.
    let resolvedSessionId = data.sessionId;
    const sessionExists = campaign.sessions.some((s) => s.id === data.sessionId);

    if (!sessionExists) {
      const maxSessionNumber =
        campaign.sessions.length > 0
          ? Math.max(...campaign.sessions.map((s) => s.sessionNumber))
          : 0;
      const now = new Date();
      const autoSession: EmbeddedSession = {
        id: randomUUID(),
        title: `Sesión ${maxSessionNumber + 1}`,
        notes: "Sesión creada automáticamente desde Discord",
        sessionNumber: maxSessionNumber + 1,
        date: now,
      };
      const updatedCampaign = await campaignRepository.addSession(
        data.campaignId,
        autoSession
      );
      if (!updatedCampaign) {
        throw new Error("Error al crear la sesión automáticamente");
      }
      resolvedSessionId = autoSession.id;
    }

    // Step 3: Snapshot speaker mappings
    const speakers = [...(campaign.discordSpeakerMappings ?? [])];

    // Step 4: Build recording data and validate
    const now = new Date();
    const recordingData: Omit<RecordingI, "id"> = {
      campaignId: data.campaignId,
      sessionId: resolvedSessionId,
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
