export interface TranscribeRequest {
    audio: string;
    language?: string;
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
//# sourceMappingURL=types.d.ts.map