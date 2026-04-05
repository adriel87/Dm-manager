export interface TranscribeRequest {
  audio: string; // base64 OGG/Opus
  language?: string; // default: "es"
}

export interface Segment {
  text: string;
  startTime: number;
  endTime: number;
}

export interface TranscribeResponse {
  segments: Segment[];
  durationSeconds: number;
}
