import { TranscriptionSegment } from './recording';

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  durationSeconds: number;
}

export interface TranscriptionProviderPort {
  transcribe(audioBuffer: Buffer, language?: string): Promise<TranscriptionResult>;
  readonly name: string;
}
