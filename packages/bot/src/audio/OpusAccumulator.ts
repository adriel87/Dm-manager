/**
 * OpusAccumulator.ts — Phase 3
 *
 * Accumulates raw Opus frames in memory while a user speaks,
 * then converts them to a valid OGG/Opus Buffer via ffmpeg on flush().
 *
 * Pipeline:
 *   raw Opus frames (from Discord) → opusscript decoder → PCM s16le
 *   → ffmpeg (-f s16le → -f ogg -c:a libopus) → OGG/Opus Buffer
 *
 * Why not `-f opus` directly in ffmpeg?
 * The raw Opus demuxer is not included in most static ffmpeg builds
 * (neither Windows gyan.dev nor Linux johnvansickle). Using PCM as
 * the intermediary format works universally.
 */

import { spawn } from 'child_process'
import ffmpegPath from 'ffmpeg-static'
import OpusScript from 'opusscript'

export class OpusAccumulator {
  private readonly userId: string
  private readonly frames: Buffer[] = []

  constructor(userId: string) {
    this.userId = userId
  }

  /** Adds an Opus frame (20ms) to the internal buffer */
  push(chunk: Buffer): void {
    this.frames.push(chunk)
  }

  /** True if no frames have been accumulated */
  isEmpty(): boolean {
    return this.frames.length === 0
  }

  /** Count of accumulated frames */
  get frameCount(): number {
    return this.frames.length
  }

  /**
   * Converts accumulated frames to OGG/Opus using ffmpeg.
   * Returns a Buffer with the complete OGG file.
   * Throws if no frames (isEmpty() === true).
   * Throws if ffmpeg fails.
   */
  flush(): Promise<Buffer> {
    if (this.isEmpty()) {
      return Promise.reject(new Error(`OpusAccumulator (${this.userId}): no frames to flush`))
    }

    if (!ffmpegPath) {
      return Promise.reject(
        new Error('ffmpeg-static returned null — ffmpeg is not installed or not found')
      )
    }

    // Decode each Opus frame to PCM (s16le, 48kHz, stereo) using opusscript.
    // opusscript is pure JS/WASM — no native bindings, works on all platforms.
    const decoder = new OpusScript(48000, 2)
    const pcmChunks = this.frames.map(frame => Buffer.from(decoder.decode(frame)))
    const pcmData = Buffer.concat(pcmChunks)
    decoder.delete()

    return new Promise<Buffer>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        '-f', 's16le',    // PCM 16-bit little-endian (universal format)
        '-ar', '48000',   // 48kHz — Discord sample rate
        '-ac', '2',       // stereo
        '-i', 'pipe:0',
        '-f', 'ogg',
        '-c:a', 'libopus',
        'pipe:1',
      ])

      const outputChunks: Buffer[] = []
      const stderrOutput: string[] = []

      proc.stdout.on('data', (chunk: Buffer) => {
        outputChunks.push(chunk)
      })

      proc.stderr.on('data', (data: Buffer) => {
        stderrOutput.push(data.toString())
      })

      proc.on('close', (code: number | null) => {
        if (code !== null && code !== 0) {
          reject(
            new Error(
              `ffmpeg exited with code ${code} for user ${this.userId}.\nstderr: ${stderrOutput.join('')}`
            )
          )
          return
        }
        resolve(Buffer.concat(outputChunks))
      })

      // Write PCM data to stdin
      proc.stdin.write(pcmData)
      proc.stdin.end()
    })
  }
}
