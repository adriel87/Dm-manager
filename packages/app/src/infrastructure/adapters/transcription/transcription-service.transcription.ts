import { TranscriptionProviderPort, TranscriptionResult } from '@/domain/recording/TranscriptionProvider';
import { TranscriptionSegment } from '@/domain/recording/recording';

interface ServiceSegment {
  text: string;
  startTime: number;
  endTime: number;
}

interface ServiceResponse {
  segments: ServiceSegment[];
  durationSeconds: number;
}

export const transcriptionServiceProvider: TranscriptionProviderPort = {
  name: 'transcription-service',

  async transcribe(audioBuffer: Buffer, language = 'es'): Promise<TranscriptionResult> {
    const url = process.env.TRANSCRIPTION_SERVICE_URL;
    if (!url) {
      throw new Error(
        'TRANSCRIPTION_SERVICE_URL is not set. Set it to the transcription service URL (e.g. http://localhost:3002) to use the transcription-service provider.'
      );
    }

    const response = await fetch(`${url.replace(/\/$/, '')}/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: audioBuffer.toString('base64'), language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Transcription service request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = (await response.json()) as ServiceResponse;

    const segments: TranscriptionSegment[] = data.segments.map((seg) => ({
      speakerDiscordUserId: '',
      speakerLabel: '',
      text: seg.text,
      startTime: seg.startTime,
      endTime: seg.endTime,
    }));

    return { segments, durationSeconds: data.durationSeconds };
  },
};
