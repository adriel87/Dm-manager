import { whisperApiProvider } from '../adapters/transcription/whisper-api.transcription';
import { whisperLocalProvider } from '../adapters/transcription/whisper-local.transcription';
import { transcriptionServiceProvider } from '../adapters/transcription/transcription-service.transcription';
import { TranscriptionProviderPort } from '@/domain/recording/TranscriptionProvider';

const provider = process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api';

function resolveProvider(): TranscriptionProviderPort {
  if (provider === 'transcription-service') return transcriptionServiceProvider;
  if (provider === 'whisper-local') return whisperLocalProvider;
  return whisperApiProvider;
}

export const transcriptionProvider: TranscriptionProviderPort = resolveProvider();
