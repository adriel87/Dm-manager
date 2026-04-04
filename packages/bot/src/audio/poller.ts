/**
 * poller.ts
 *
 * Polls the DM Manager API until a recording reaches 'transcribed' or 'failed' status,
 * or until maxAttempts is exhausted.
 */

import type { Recording } from '../types/dm-manager.js'

export interface PollOptions {
  campaignId: string
  recordingId: string
  /** Maximum number of polling attempts. Default: 20 */
  maxAttempts?: number
  /** Milliseconds to wait between attempts. Default: 3000 */
  intervalMs?: number
  client: {
    getRecordings: (campaignId: string, sessionId?: string) => Promise<Recording[]>
  }
}

export type PollResult =
  | { ok: true; recording: Recording }
  | { ok: false; error: string }

/**
 * Polls `client.getRecordings(campaignId)` until the recording with `recordingId`
 * reaches a terminal status ('transcribed' or 'failed'), or until maxAttempts is reached.
 */
export async function pollUntilTranscribed(opts: PollOptions): Promise<PollResult> {
  const {
    campaignId,
    recordingId,
    maxAttempts = 20,
    intervalMs = 3000,
    client,
  } = opts

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0 && intervalMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs))
    }

    const recordings = await client.getRecordings(campaignId)
    const recording = recordings.find((r) => r.id === recordingId)

    if (!recording) {
      // Not found yet — keep waiting
      continue
    }

    if (recording.status === 'transcribed') {
      return { ok: true, recording }
    }

    if (recording.status === 'failed') {
      return {
        ok: false,
        error: recording.transcriptionError ?? 'Transcription failed',
      }
    }

    // status is 'recording' or 'processing' — keep waiting
  }

  return { ok: false, error: 'Timeout: transcription took too long' }
}
