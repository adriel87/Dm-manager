import { RecordingI, SpeakerMapping, TranscriptionSegment } from "@/domain/recording/recording";
import { Document, WithId } from "mongodb";

export const recordingMappers = {
  fromMongoDocumentToEntity: (doc: Document | WithId<Document>): RecordingI => {
    if (!doc) {
      throw new Error("Document is null or undefined");
    }

    const speakers: SpeakerMapping[] = Array.isArray(doc.speakers)
      ? doc.speakers.map((s: SpeakerMapping) => ({
          discordUserId: s.discordUserId,
          discordUsername: s.discordUsername,
          characterId: s.characterId ?? null,
          characterName: s.characterName ?? null,
          label: s.label,
          role: s.role,
        }))
      : [];

    const transcription: TranscriptionSegment[] | null = Array.isArray(
      doc.transcription,
    )
      ? doc.transcription.map((seg: TranscriptionSegment) => ({
          speakerDiscordUserId: seg.speakerDiscordUserId,
          speakerLabel: seg.speakerLabel,
          text: seg.text,
          startTime: seg.startTime,
          endTime: seg.endTime,
        }))
      : null;

    return {
      id: doc._id.toString(),
      campaignId: doc.campaignId,
      sessionId: doc.sessionId,
      status: doc.status,
      audioFilePath: doc.audioFilePath ?? null,
      durationSeconds: doc.durationSeconds ?? null,
      speakers,
      transcription,
      transcriptionProvider: doc.transcriptionProvider ?? null,
      transcriptionError: doc.transcriptionError ?? null,
      discordGuildId: doc.discordGuildId,
      discordChannelId: doc.discordChannelId,
      startedAt: new Date(doc.startedAt),
      stoppedAt: doc.stoppedAt ? new Date(doc.stoppedAt) : null,
      transcribedAt: doc.transcribedAt ? new Date(doc.transcribedAt) : null,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  },
};
