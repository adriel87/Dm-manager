import { whisperApiProvider } from '../adapters/transcription/whisper-api.transcription';
import { whisperLocalProvider } from '../adapters/transcription/whisper-local.transcription';
import { TranscriptionProviderPort } from '@/domain/recording/TranscriptionProvider';

const provider = process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api';

export const transcriptionProvider: TranscriptionProviderPort =
  provider === 'whisper-local' ? whisperLocalProvider : whisperApiProvider;
