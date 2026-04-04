/**
 * RecordingSession.ts — Phase 3
 *
 * Manages the recording of all active speakers in a voice channel
 * during a single recording session.
 */

import type { VoiceConnection } from '@discordjs/voice'
import { EndBehaviorType } from '@discordjs/voice'
import { OpusAccumulator } from './OpusAccumulator.js'

export class RecordingSession {
  private readonly connection: VoiceConnection
  private readonly accumulators = new Map<string, OpusAccumulator>()
  private startedAt: number | null = null

  constructor(voiceConnection: VoiceConnection) {
    this.connection = voiceConnection
  }

  /**
   * Starts audio capture.
   * Subscribes to speaking.on('start') to create an OpusAccumulator per new speaker.
   * Connects each AudioReceiveStream to its OpusAccumulator.
   */
  start(): void {
    this.startedAt = Date.now()

    this.connection.receiver.speaking.on('start', (userId: string) => {
      // Don't create a second accumulator for the same speaker
      if (this.accumulators.has(userId)) return

      const accumulator = new OpusAccumulator(userId)
      this.accumulators.set(userId, accumulator)

      const stream = this.connection.receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.Manual,
        },
      })

      stream.on('data', (chunk: Buffer) => {
        accumulator.push(chunk)
      })
    })
  }

  /**
   * Stops capture and converts all speaker buffers to base64.
   * Returns Record<userId, base64OGGString>.
   * Only includes speakers with frameCount > 0.
   * Runs all flush() in parallel.
   */
  async stop(): Promise<Record<string, string>> {
    const entries = Array.from(this.accumulators.entries()).filter(
      ([, acc]) => !acc.isEmpty()
    )

    const results = await Promise.all(
      entries.map(async ([userId, acc]) => {
        const buffer = await acc.flush()
        return [userId, buffer.toString('base64')] as [string, string]
      })
    )

    return Object.fromEntries(results)
  }

  /**
   * Duration in seconds from start() until now (or until stop()).
   */
  getDurationSeconds(): number {
    if (this.startedAt === null) return 0
    return Math.floor((Date.now() - this.startedAt) / 1000)
  }

  /**
   * IDs of users who spoke (had at least one frame).
   */
  getSpeakerIds(): string[] {
    return Array.from(this.accumulators.keys())
  }
}
