import { TranscribeResponse } from '../types';
import { transcribeWithWhisperApi } from './whisper-api.provider';
import { transcribeWithWhisperLocal } from './whisper-local.provider';

export type TranscribeFn = (audioBuffer: Buffer, language?: string) => Promise<TranscribeResponse>;

export function getProvider(): TranscribeFn {
  const p = process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api';
  if (p === 'whisper-local') return transcribeWithWhisperLocal;
  return transcribeWithWhisperApi;
}
