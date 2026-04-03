import { TranscriptionProviderPort, TranscriptionResult } from '@/domain/recording/TranscriptionProvider';
import { TranscriptionSegment } from '@/domain/recording/recording';

interface WhisperVerboseJsonSegment {
  start: number;
  end: number;
  text: string;
}

interface WhisperVerboseJsonResponse {
  segments: WhisperVerboseJsonSegment[];
  duration: number;
}

export const whisperLocalProvider: TranscriptionProviderPort = {
  name: 'whisper-local',

  async transcribe(audioBuffer: Buffer, language = 'es'): Promise<TranscriptionResult> {
    const baseUrl = process.env.WHISPER_LOCAL_URL;
    if (!baseUrl) {
      throw new Error(
        'WHISPER_LOCAL_URL is not set. Set it to your local Whisper server URL (e.g. http://localhost:8080) to use the whisper-local provider.'
      );
    }

    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('language', language);

    const endpoint = `${baseUrl.replace(/\/$/, '')}/v1/audio/transcriptions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Local Whisper server request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = (await response.json()) as WhisperVerboseJsonResponse;

    const segments: TranscriptionSegment[] = data.segments.map((seg) => ({
      speakerDiscordUserId: '',
      speakerLabel: '',
      text: seg.text.trim(),
      startTime: seg.start,
      endTime: seg.end,
    }));

    return {
      segments,
      durationSeconds: data.duration,
    };
  },
};
