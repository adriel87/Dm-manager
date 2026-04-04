/**
 * RecordingSession.test.ts — Phase 3 TDD
 *
 * Tests for RecordingSession which manages all speakers in a guild
 * during an active recording.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from 'events'

// Mock @discordjs/voice before importing RecordingSession
vi.mock('@discordjs/voice')

// Mock OpusAccumulator — we test RecordingSession in isolation
vi.mock('../../src/audio/OpusAccumulator.js')

import { RecordingSession } from '../../src/audio/RecordingSession.js'
import { OpusAccumulator } from '../../src/audio/OpusAccumulator.js'

// ----------------------------------------------------------------
// Helpers: fake VoiceConnection
// ----------------------------------------------------------------

class FakeSpeakingStream extends EventEmitter {}
class FakeAudioReceiveStream extends EventEmitter {}

interface FakeVoiceConnection {
  receiver: {
    speaking: FakeSpeakingStream
    subscribe: ReturnType<typeof vi.fn>
  }
}

function createFakeConnection(): FakeVoiceConnection {
  const speaking = new FakeSpeakingStream()
  const subscribe = vi.fn()
  return {
    receiver: {
      speaking,
      subscribe,
    },
  }
}

// ----------------------------------------------------------------
// Mock OpusAccumulator factory
// ----------------------------------------------------------------

function makeMockAccumulator(opts: { isEmpty?: boolean; flushResult?: Buffer } = {}) {
  const isEmpty = opts.isEmpty ?? false
  const flushResult = opts.flushResult ?? Buffer.from([0x01, 0x02])

  return {
    push: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(isEmpty),
    frameCount: isEmpty ? 0 : 1,
    flush: vi.fn().mockResolvedValue(flushResult),
  }
}

describe('RecordingSession', () => {
  beforeEach(() => vi.clearAllMocks())

  // ----------------------------------------------------------------
  // TC-1: start() suscribe al evento speaking
  // ----------------------------------------------------------------
  it('TC-1: start() suscribe al evento speaking', () => {
    const conn = createFakeConnection()
    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)

    const onSpy = vi.spyOn(conn.receiver.speaking, 'on')

    session.start()

    expect(onSpy).toHaveBeenCalledWith('start', expect.any(Function))
  })

  // ----------------------------------------------------------------
  // TC-2: nuevo speaker crea un OpusAccumulator
  // ----------------------------------------------------------------
  it('TC-2: nuevo speaker crea un OpusAccumulator', () => {
    const conn = createFakeConnection()
    const mockAcc = makeMockAccumulator()
    vi.mocked(OpusAccumulator).mockReturnValue(mockAcc as unknown as OpusAccumulator)

    // subscribe returns a fake audio stream
    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    // Simulate a new speaker
    conn.receiver.speaking.emit('start', 'user-1')

    expect(OpusAccumulator).toHaveBeenCalledWith('user-1')
  })

  // ----------------------------------------------------------------
  // TC-3: frames del stream van al OpusAccumulator
  // ----------------------------------------------------------------
  it('TC-3: frames del stream van al OpusAccumulator — push() es llamado', () => {
    const conn = createFakeConnection()
    const mockAcc = makeMockAccumulator()
    vi.mocked(OpusAccumulator).mockReturnValue(mockAcc as unknown as OpusAccumulator)

    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    conn.receiver.speaking.emit('start', 'user-1')

    const audioChunk = Buffer.from([0xde, 0xad, 0xbe, 0xef])
    fakeStream.emit('data', audioChunk)

    expect(mockAcc.push).toHaveBeenCalledWith(audioChunk)
  })

  // ----------------------------------------------------------------
  // TC-4: el mismo speaker no crea un segundo acumulador
  // ----------------------------------------------------------------
  it('TC-4: el mismo speaker no crea un segundo acumulador', () => {
    const conn = createFakeConnection()
    const mockAcc = makeMockAccumulator()
    vi.mocked(OpusAccumulator).mockReturnValue(mockAcc as unknown as OpusAccumulator)

    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    // Same userId twice
    conn.receiver.speaking.emit('start', 'user-1')
    conn.receiver.speaking.emit('start', 'user-1')

    // OpusAccumulator constructor should only be called once
    expect(OpusAccumulator).toHaveBeenCalledTimes(1)
  })

  // ----------------------------------------------------------------
  // TC-5: stop() llama flush() en todos los acumuladores con frames
  // ----------------------------------------------------------------
  it('TC-5: stop() llama flush() en todos los acumuladores con frames', async () => {
    const conn = createFakeConnection()

    const acc1 = makeMockAccumulator({ flushResult: Buffer.from([0x01]) })
    const acc2 = makeMockAccumulator({ flushResult: Buffer.from([0x02]) })

    vi.mocked(OpusAccumulator)
      .mockReturnValueOnce(acc1 as unknown as OpusAccumulator)
      .mockReturnValueOnce(acc2 as unknown as OpusAccumulator)

    const fakeStream1 = new FakeAudioReceiveStream()
    const fakeStream2 = new FakeAudioReceiveStream()
    conn.receiver.subscribe
      .mockReturnValueOnce(fakeStream1)
      .mockReturnValueOnce(fakeStream2)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    conn.receiver.speaking.emit('start', 'user-1')
    conn.receiver.speaking.emit('start', 'user-2')

    await session.stop()

    expect(acc1.flush).toHaveBeenCalled()
    expect(acc2.flush).toHaveBeenCalled()
  })

  // ----------------------------------------------------------------
  // TC-6: stop() excluye speakers sin frames
  // ----------------------------------------------------------------
  it('TC-6: stop() excluye speakers sin frames — isEmpty() === true', async () => {
    const conn = createFakeConnection()

    const emptyAcc = makeMockAccumulator({ isEmpty: true })
    vi.mocked(OpusAccumulator).mockReturnValue(emptyAcc as unknown as OpusAccumulator)

    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    conn.receiver.speaking.emit('start', 'user-1')

    const result = await session.stop()

    expect(emptyAcc.flush).not.toHaveBeenCalled()
    expect(result).not.toHaveProperty('user-1')
  })

  // ----------------------------------------------------------------
  // TC-7: stop() retorna base64 correcto
  // ----------------------------------------------------------------
  it('TC-7: stop() retorna base64 correcto', async () => {
    const conn = createFakeConnection()

    const expectedBuffer = Buffer.from([0x01, 0x02])
    const acc = makeMockAccumulator({ flushResult: expectedBuffer })
    vi.mocked(OpusAccumulator).mockReturnValue(acc as unknown as OpusAccumulator)

    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    conn.receiver.speaking.emit('start', 'user-1')

    const result = await session.stop()

    expect(result['user-1']).toBe(expectedBuffer.toString('base64'))
  })

  // ----------------------------------------------------------------
  // TC-8: getDurationSeconds() retorna segundos correctos
  // ----------------------------------------------------------------
  it('TC-8: getDurationSeconds() retorna segundos correctos', () => {
    const conn = createFakeConnection()

    // Mock Date.now to control time
    const startTime = 1_700_000_000_000
    const endTime = startTime + 5_000 // 5 seconds later

    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(startTime) // called in start()
      .mockReturnValueOnce(endTime)   // called in getDurationSeconds()

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    expect(session.getDurationSeconds()).toBe(5)
  })

  // ----------------------------------------------------------------
  // TC-9: getSpeakerIds() retorna los userIds que hablaron
  // ----------------------------------------------------------------
  it('TC-9: getSpeakerIds() retorna los userIds que hablaron', () => {
    const conn = createFakeConnection()

    vi.mocked(OpusAccumulator).mockReturnValue(makeMockAccumulator() as unknown as OpusAccumulator)

    const fakeStream = new FakeAudioReceiveStream()
    conn.receiver.subscribe.mockReturnValue(fakeStream)

    const session = new RecordingSession(conn as unknown as import('@discordjs/voice').VoiceConnection)
    session.start()

    conn.receiver.speaking.emit('start', 'user-1')
    conn.receiver.speaking.emit('start', 'user-2')

    const ids = session.getSpeakerIds()

    expect(ids).toContain('user-1')
    expect(ids).toContain('user-2')
    expect(ids).toHaveLength(2)
  })
})
