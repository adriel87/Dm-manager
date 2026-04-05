import { TranscribeResponse } from '../types';
export type TranscribeFn = (audioBuffer: Buffer, language?: string) => Promise<TranscribeResponse>;
export declare function getProvider(): TranscribeFn;
//# sourceMappingURL=index.d.ts.map