import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startRecording,
  stopRecording,
  transcribeRecording,
  getRecordings,
  getCampaigns,
} from '../../src/api/dm-manager.client.js'

// ============================================================
// Helpers
// ============================================================

/**
 * Build a minimal mock Response object that satisfies what `request()` needs.
 * `ok` defaults to true; `status` defaults to 200.
 */
function mockResponse(
  body: unknown,
  options: { ok?: boolean; status?: number; isJson?: boolean } = {}
): Response {
  const { ok = true, status = 200, isJson = true } = options

  const jsonFn = isJson
    ? vi.fn().mockResolvedValue(body)
    : vi.fn().mockRejectedValue(new SyntaxError('not json'))

  const textFn = vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body))

  return {
    ok,
    status,
    json: jsonFn,
    text: textFn,
  } as unknown as Response
}

/** Minimal recording fixture used across multiple tests. */
const RECORDING = {
  id: 'rec-1',
  campaignId: 'camp-1',
  sessionId: 'sess-1',
  status: 'recording' as const,
  audioFilePath: null,
  durationSeconds: null,
  speakers: [],
  transcription: null,
  transcriptionProvider: null,
  transcriptionError: null,
  discordGuildId: 'guild-1',
  discordChannelId: 'channel-1',
  startedAt: '2024-01-01T00:00:00.000Z',
  stoppedAt: null,
  transcribedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

// ============================================================
// Test setup
// ============================================================

describe('dm-manager.client', () => {
  beforeEach(() => {
    process.env.DM_MANAGER_URL = 'http://localhost:3000'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    delete process.env.DM_MANAGER_URL
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // ============================================================
  // getBaseUrl (tested indirectly via each public function)
  // ============================================================

  describe('getBaseUrl()', () => {
    it('should throw when DM_MANAGER_URL is not set', async () => {
      delete process.env.DM_MANAGER_URL

      await expect(getCampaigns()).rejects.toThrow(
        'DM_MANAGER_URL is not set'
      )
    })

    it('should strip a trailing slash from the URL', async () => {
      process.env.DM_MANAGER_URL = 'http://localhost:3000/'
      vi.mocked(fetch).mockResolvedValue(mockResponse([]))

      await getCampaigns()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign',
        expect.any(Object)
      )
    })

    it('should not double-slash when URL has no trailing slash', async () => {
      process.env.DM_MANAGER_URL = 'http://localhost:3000'
      vi.mocked(fetch).mockResolvedValue(mockResponse([]))

      await getCampaigns()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign',
        expect.any(Object)
      )
    })
  })

  // ============================================================
  // request() — error handling
  // ============================================================

  describe('request() error handling', () => {
    it('should throw a timeout message when fetch throws AbortError', async () => {
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      vi.mocked(fetch).mockRejectedValue(abortError)

      await expect(getCampaigns()).rejects.toThrow(/timed out after \d+ms/)
    })

    it('should include the URL in the timeout error', async () => {
      const abortError = new Error('aborted')
      abortError.name = 'AbortError'
      vi.mocked(fetch).mockRejectedValue(abortError)

      await expect(getCampaigns()).rejects.toThrow('http://localhost:3000/api/campaign')
    })

    it('should rethrow non-abort network errors with a descriptive message', async () => {
      vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(getCampaigns()).rejects.toThrow('DM Manager request failed')
    })

    it('should throw an API error on non-2xx response with JSON body', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Campaign not found' }, { ok: false, status: 404 })
      )

      await expect(getCampaigns()).rejects.toThrow('DM Manager API error 404')
    })

    it('should include the error detail from the JSON body in the thrown message', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Campaign not found' }, { ok: false, status: 404 })
      )

      await expect(getCampaigns()).rejects.toThrow('Campaign not found')
    })

    it('should fall back to text when error body is not valid JSON', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse('Internal Server Error', { ok: false, status: 500, isJson: false })
      )

      await expect(getCampaigns()).rejects.toThrow('DM Manager API error 500')
    })

    it('should throw API error with status and URL even when body is empty', async () => {
      const emptyResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValue(new SyntaxError('no body')),
        text: vi.fn().mockResolvedValue(''),
      } as unknown as Response

      vi.mocked(fetch).mockResolvedValue(emptyResponse)

      await expect(getCampaigns()).rejects.toThrow('DM Manager API error 503')
    })

    it('should not append a colon-separator when error detail is empty', async () => {
      const emptyResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValue(new SyntaxError('no body')),
        text: vi.fn().mockResolvedValue(''),
      } as unknown as Response

      vi.mocked(fetch).mockResolvedValue(emptyResponse)

      // Message should end with the URL, no trailing ": "
      await expect(getCampaigns()).rejects.toThrow(
        /DM Manager API error 503 at http:\/\/localhost:3000\/api\/campaign$/
      )
    })
  })

  // ============================================================
  // startRecording
  // ============================================================

  describe('startRecording()', () => {
    const input = {
      sessionId: 'sess-1',
      discordGuildId: 'guild-1',
      discordChannelId: 'channel-1',
    }

    it('should POST to /api/campaign/{id}/recordings', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(RECORDING))

      await startRecording('camp-1', input)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign/camp-1/recordings',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should send the input as JSON in the request body', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(RECORDING))

      await startRecording('camp-1', input)

      const [, options] = vi.mocked(fetch).mock.calls[0]
      expect((options as RequestInit).body).toBe(JSON.stringify(input))
    })

    it('should set Content-Type: application/json', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(RECORDING))

      await startRecording('camp-1', input)

      const [, options] = vi.mocked(fetch).mock.calls[0]
      expect((options as RequestInit).headers).toMatchObject({
        'Content-Type': 'application/json',
      })
    })

    it('should return the recording from the response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(RECORDING))

      const result = await startRecording('camp-1', input)

      expect(result).toEqual(RECORDING)
    })

    it('should throw when the API returns an error', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Session not found' }, { ok: false, status: 400 })
      )

      await expect(startRecording('camp-1', input)).rejects.toThrow('Session not found')
    })
  })

  // ============================================================
  // stopRecording
  // ============================================================

  describe('stopRecording()', () => {
    const input = {
      durationSeconds: 120,
      audioData: { 'user-1': 'base64audiodata==' },
    }

    it('should PUT to /api/campaign/{id}/recordings/{recordingId}/stop', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ ...RECORDING, status: 'processing' }))

      await stopRecording('camp-1', 'rec-1', input)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign/camp-1/recordings/rec-1/stop',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('should send the input as JSON in the request body', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ ...RECORDING, status: 'processing' }))

      await stopRecording('camp-1', 'rec-1', input)

      const [, options] = vi.mocked(fetch).mock.calls[0]
      expect((options as RequestInit).body).toBe(JSON.stringify(input))
    })

    it('should return the updated recording', async () => {
      const stoppedRecording = { ...RECORDING, status: 'processing' as const }
      vi.mocked(fetch).mockResolvedValue(mockResponse(stoppedRecording))

      const result = await stopRecording('camp-1', 'rec-1', input)

      expect(result).toEqual(stoppedRecording)
    })

    it('should throw when the API returns an error', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Recording not found' }, { ok: false, status: 404 })
      )

      await expect(stopRecording('camp-1', 'rec-1', input)).rejects.toThrow('Recording not found')
    })
  })

  // ============================================================
  // transcribeRecording
  // ============================================================

  describe('transcribeRecording()', () => {
    it('should POST to /api/campaign/{id}/recordings/{recordingId}/transcribe', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ ...RECORDING, status: 'transcribed' }))

      await transcribeRecording('camp-1', 'rec-1')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign/camp-1/recordings/rec-1/transcribe',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should default input to an empty object when not provided', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ ...RECORDING, status: 'transcribed' }))

      await transcribeRecording('camp-1', 'rec-1')

      const [, options] = vi.mocked(fetch).mock.calls[0]
      expect((options as RequestInit).body).toBe(JSON.stringify({}))
    })

    it('should forward the language option when provided', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ ...RECORDING, status: 'transcribed' }))

      await transcribeRecording('camp-1', 'rec-1', { language: 'en' })

      const [, options] = vi.mocked(fetch).mock.calls[0]
      expect((options as RequestInit).body).toBe(JSON.stringify({ language: 'en' }))
    })

    it('should return the transcribed recording', async () => {
      const transcribed = { ...RECORDING, status: 'transcribed' as const }
      vi.mocked(fetch).mockResolvedValue(mockResponse(transcribed))

      const result = await transcribeRecording('camp-1', 'rec-1', { language: 'es' })

      expect(result).toEqual(transcribed)
    })

    it('should throw when transcription fails on the server', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Transcription provider unavailable' }, { ok: false, status: 503 })
      )

      await expect(transcribeRecording('camp-1', 'rec-1')).rejects.toThrow(
        'Transcription provider unavailable'
      )
    })
  })

  // ============================================================
  // getRecordings
  // ============================================================

  describe('getRecordings()', () => {
    it('should GET /api/campaign/{id}/recordings without sessionId', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([RECORDING]))

      await getRecordings('camp-1')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign/camp-1/recordings',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should append ?sessionId= to the URL when sessionId is provided', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([RECORDING]))

      await getRecordings('camp-1', 'sess-42')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign/camp-1/recordings?sessionId=sess-42',
        expect.any(Object)
      )
    })

    it('should NOT append a query string when sessionId is undefined', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([RECORDING]))

      await getRecordings('camp-1', undefined)

      const [url] = vi.mocked(fetch).mock.calls[0]
      expect(url as string).not.toContain('?')
    })

    it('should return the array of recordings', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([RECORDING]))

      const result = await getRecordings('camp-1')

      expect(result).toEqual([RECORDING])
    })

    it('should return an empty array when the campaign has no recordings', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([]))

      const result = await getRecordings('camp-1')

      expect(result).toEqual([])
    })

    it('should throw when the API returns an error', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Campaign not found' }, { ok: false, status: 404 })
      )

      await expect(getRecordings('camp-1')).rejects.toThrow('Campaign not found')
    })
  })

  // ============================================================
  // getCampaigns
  // ============================================================

  describe('getCampaigns()', () => {
    const campaigns = [
      { id: 'camp-1', name: 'The Lost Mine', status: 'active' },
      { id: 'camp-2', name: 'Curse of Strahd', status: 'active' },
    ]

    it('should GET /api/campaign', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(campaigns))

      await getCampaigns()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/campaign',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should return the array of campaigns', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(campaigns))

      const result = await getCampaigns()

      expect(result).toEqual(campaigns)
    })

    it('should return an empty array when there are no campaigns', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse([]))

      const result = await getCampaigns()

      expect(result).toEqual([])
    })

    it('should throw when the API returns an error', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ error: 'Unauthorized' }, { ok: false, status: 401 })
      )

      await expect(getCampaigns()).rejects.toThrow('Unauthorized')
    })
  })
})
