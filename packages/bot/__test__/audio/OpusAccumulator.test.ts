/**
 * OpusAccumulator.test.ts — Phase 3 TDD
 *
 * Tests for the OpusAccumulator class that accumulates raw Opus frames
 * and converts them to OGG/Opus via ffmpeg on flush().
 */

import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest'
import { EventEmitter } from 'events'

// Mock ffmpeg-static before importing OpusAccumulator
vi.mock('ffmpeg-static', () => ({ default: '/usr/bin/ffmpeg' }))

// Mock child_process
vi.mock('child_process')

// Mock opusscript — identity decoder (decode returns the input buffer)
// so PCM output equals the concatenation of input frames, keeping tests simple.
vi.mock('opusscript', () => ({
  default: vi.fn().mockImplementation(() => ({
    decode: vi.fn((frame: Buffer) => frame),
    delete: vi.fn(),
  })),
}))

import { OpusAccumulator } from '../../src/audio/OpusAccumulator.js'
import * as childProcess from 'child_process'

// ----------------------------------------------------------------
// Helper: create a fake ffmpeg process
// The fake process is itself an EventEmitter (so proc.on('close', ...) works),
// and has stdin/stdout/stderr as EventEmitters.
// ----------------------------------------------------------------
class FakeProcess extends EventEmitter {
  stdin: { write: MockInstance; end: MockInstance }
  stdout: EventEmitter
  stderr: EventEmitter

  constructor() {
    super()
    this.stdout = new EventEmitter()
    this.stderr = new EventEmitter()
    this.stdin = {
      write: vi.fn(),
      end: vi.fn(),
    }
  }
}

function createFakeProcess(): FakeProcess {
  return new FakeProcess()
}

describe('OpusAccumulator', () => {
  beforeEach(() => vi.clearAllMocks())

  // ----------------------------------------------------------------
  // TC-1: push acumula frames
  // ----------------------------------------------------------------
  it('TC-1: push acumula frames — frameCount === 3, isEmpty() === false', () => {
    const acc = new OpusAccumulator('user-1')
    acc.push(Buffer.from([0x01]))
    acc.push(Buffer.from([0x02]))
    acc.push(Buffer.from([0x03]))

    expect(acc.frameCount).toBe(3)
    expect(acc.isEmpty()).toBe(false)
  })

  // ----------------------------------------------------------------
  // TC-2: isEmpty() al inicio
  // ----------------------------------------------------------------
  it('TC-2: isEmpty() al inicio — true, frameCount === 0', () => {
    const acc = new OpusAccumulator('user-1')

    expect(acc.isEmpty()).toBe(true)
    expect(acc.frameCount).toBe(0)
  })

  // ----------------------------------------------------------------
  // TC-3: flush() lanza si no hay frames
  // ----------------------------------------------------------------
  it('TC-3: flush() lanza si no hay frames — rechaza con mensaje descriptivo', async () => {
    const acc = new OpusAccumulator('user-1')

    await expect(acc.flush()).rejects.toThrow(/no frames/i)
  })

  // ----------------------------------------------------------------
  // TC-4: flush() escribe frames al stdin de ffmpeg
  // ----------------------------------------------------------------
  it('TC-4: flush() escribe frames al stdin de ffmpeg', async () => {
    const fakeProc = createFakeProcess()
    vi.mocked(childProcess.spawn).mockReturnValue(fakeProc as unknown as ReturnType<typeof childProcess.spawn>)

    const acc = new OpusAccumulator('user-1')
    const frame1 = Buffer.from([0x01, 0x02])
    const frame2 = Buffer.from([0x03, 0x04])
    acc.push(frame1)
    acc.push(frame2)

    // Start flush() — it will await the process close event
    const flushPromise = acc.flush()

    // Simulate ffmpeg finishing successfully: emit process close with code 0
    fakeProc.emit('close', 0)

    await flushPromise

    // stdin.write should have been called with the concatenated frames
    expect(fakeProc.stdin.write).toHaveBeenCalledWith(Buffer.concat([frame1, frame2]))
    expect(fakeProc.stdin.end).toHaveBeenCalled()
  })

  // ----------------------------------------------------------------
  // TC-5: flush() retorna el Buffer de stdout
  // ----------------------------------------------------------------
  it('TC-5: flush() retorna el Buffer de stdout — concatena chunks correctamente', async () => {
    const fakeProc = createFakeProcess()
    vi.mocked(childProcess.spawn).mockReturnValue(fakeProc as unknown as ReturnType<typeof childProcess.spawn>)

    const acc = new OpusAccumulator('user-1')
    acc.push(Buffer.from([0x00]))

    const chunk1 = Buffer.from([0x4f, 0x67, 0x67, 0x53]) // OggS header
    const chunk2 = Buffer.from([0x01, 0x02, 0x03])

    const flushPromise = acc.flush()

    // Emit stdout data chunks, then process close with code 0
    fakeProc.stdout.emit('data', chunk1)
    fakeProc.stdout.emit('data', chunk2)
    fakeProc.emit('close', 0)

    const result = await flushPromise

    expect(result).toEqual(Buffer.concat([chunk1, chunk2]))
  })

  // ----------------------------------------------------------------
  // TC-6: flush() rechaza si ffmpeg falla (exit code != 0)
  // ----------------------------------------------------------------
  it('TC-6: flush() rechaza si ffmpeg falla — exit code 1', async () => {
    const fakeProc = createFakeProcess()
    vi.mocked(childProcess.spawn).mockReturnValue(fakeProc as unknown as ReturnType<typeof childProcess.spawn>)

    const acc = new OpusAccumulator('user-1')
    acc.push(Buffer.from([0x00]))

    const flushPromise = acc.flush()

    // Emit stderr output and then process close with error code
    fakeProc.stderr.emit('data', Buffer.from('ffmpeg error output'))
    fakeProc.emit('close', 1)

    await expect(flushPromise).rejects.toThrow(/ffmpeg/i)
  })

  // ----------------------------------------------------------------
  // TC-7: flush() rechaza si ffmpegPath es null
  // ----------------------------------------------------------------
  describe('when ffmpegPath is null', () => {
    it('TC-7: flush() rechaza si ffmpegPath es null — error descriptivo', async () => {
      vi.doMock('ffmpeg-static', () => ({ default: null }))

      // Re-import with null path using cache-busting query string
      const { OpusAccumulator: OpusAccumulatorNull } = await import(
        '../../src/audio/OpusAccumulator.js?nullffmpeg=' + Date.now()
      )

      const acc = new OpusAccumulatorNull('user-1')
      acc.push(Buffer.from([0x00]))

      await expect(acc.flush()).rejects.toThrow(/ffmpeg/i)
    })
  })
})
