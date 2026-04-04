/**
 * OpusAccumulator.ts — Phase 3
 *
 * Accumulates raw Opus frames in memory while a user speaks,
 * then converts them to a valid OGG/Opus Buffer via ffmpeg on flush().
 */

import { spawn } from 'child_process'
import ffmpegPath from 'ffmpeg-static'

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

    return new Promise<Buffer>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        '-f', 'opus',
        '-ar', '48000',
        '-ac', '2',
        '-i', 'pipe:0',
        '-f', 'ogg',
        '-c:a', 'copy',
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

      // stdout 'close' fires after all data has been flushed (no exit code here)
      proc.stdout.on('close', () => {
        // exitCode is set once the process exits; if still null, treat as 0 (success)
        // We resolve here since stdout is fully read; if the process failed, the
        // 'close' event on proc itself fires with the code and we reject there.
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

      // Write all frames concatenated to stdin
      const combined = Buffer.concat(this.frames)
      proc.stdin.write(combined)
      proc.stdin.end()
    })
  }
}
