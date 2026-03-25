import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startRecording,
  stopRecording,
  transcribeRecording,
  retryTranscription,
  getRecording,
  getRecordingsBySession,
} from '@/application/useCases/recording';
import { setSpeakerMappings } from '@/application/useCases/campaign';
import { RecordingI, SpeakerMapping } from '@/domain/recording/recording';
import { RecordingRepository } from '@/domain/recording/RecordingRepository';
import { StorageProvider } from '@/domain/recording/StorageProvider';
import { TranscriptionProviderPort } from '@/domain/recording/TranscriptionProvider';
import { CampaignRepository } from '@/domain/campaign/CampaignRepository';
import { CampaignI } from '@/domain/campaign/campaign';

// ============================================================
// Mock repositories and providers
// ============================================================

const mockRecordingRepository: RecordingRepository = {
  getRecordingById: vi.fn(),
  getRecordingsBySession: vi.fn(),
  getRecordingsByCampaign: vi.fn(),
  createRecording: vi.fn(),
  updateRecording: vi.fn(),
  deleteRecording: vi.fn(),
};

const mockCampaignRepository: CampaignRepository = {
  getAllCampaigns: vi.fn(),
  getCampaignById: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
  addMission: vi.fn(),
  updateMission: vi.fn(),
  removeMission: vi.fn(),
  addSession: vi.fn(),
  updateSession: vi.fn(),
  removeSession: vi.fn(),
  addCharacter: vi.fn(),
  removeCharacter: vi.fn(),
  assignGroup: vi.fn(),
  removeGroup: vi.fn(),
  addNote: vi.fn(),
  removeNote: vi.fn(),
  setSpeakerMappings: vi.fn(),
};

const mockStorageProvider: StorageProvider = {
  save: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getUrl: vi.fn(),
};

const mockTranscriptionProvider: TranscriptionProviderPort = {
  transcribe: vi.fn(),
  name: 'mock-transcription-provider',
};

// ============================================================
// Test fixtures
// ============================================================

const validSpeakerMappings: SpeakerMapping[] = [
  {
    discordUserId: 'discord-user-1',
    discordUsername: 'Player1',
    characterId: 'char-1',
    characterName: 'Aragorn',
    label: 'Player 1',
    role: 'player',
  },
  {
    discordUserId: 'discord-user-2',
    discordUsername: 'DungeonMaster',
    characterId: null,
    characterName: null,
    label: 'DM',
    role: 'dm',
  },
];

const validCampaign: CampaignI = {
  id: 'campaign-1',
  name: 'The Lost Mines',
  description: 'An epic adventure',
  status: 'Activa',
  missions: [],
  sessions: [
    {
      id: 'session-1',
      title: 'Session One',
      notes: 'Some notes',
      sessionNumber: 1,
      date: new Date('2026-03-01'),
    },
  ],
  notes: [],
  characters: [],
  group: null,
  discordSpeakerMappings: validSpeakerMappings,
};

const validRecording: RecordingI = {
  id: 'recording-1',
  campaignId: 'campaign-1',
  sessionId: 'session-1',
  status: 'recording',
  audioFilePath: null,
  durationSeconds: null,
  speakers: validSpeakerMappings,
  transcription: null,
  transcriptionProvider: null,
  transcriptionError: null,
  discordGuildId: 'guild-1',
  discordChannelId: 'channel-1',
  startedAt: new Date('2026-03-01T10:00:00Z'),
  stoppedAt: null,
  transcribedAt: null,
  createdAt: new Date('2026-03-01T10:00:00Z'),
  updatedAt: new Date('2026-03-01T10:00:00Z'),
};

const processingRecording: RecordingI = {
  ...validRecording,
  id: 'recording-2',
  status: 'processing',
  audioFilePath: 'campaign-1/session-1/recording-2',
  stoppedAt: new Date('2026-03-01T11:00:00Z'),
};

const failedRecording: RecordingI = {
  ...processingRecording,
  id: 'recording-3',
  status: 'failed',
  transcriptionError: 'Provider timeout',
};

// ============================================================
// Tests
// ============================================================

describe('Recording use cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // startRecording
  // ============================================================

  describe('startRecording', () => {
    it('should create a recording successfully (happy path)', async () => {
      vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
      vi.mocked(mockRecordingRepository.createRecording).mockResolvedValue(validRecording);

      const result = await startRecording(
        mockRecordingRepository,
        mockCampaignRepository,
        {
          campaignId: 'campaign-1',
          sessionId: 'session-1',
          discordGuildId: 'guild-1',
          discordChannelId: 'channel-1',
        }
      );

      expect(result).toEqual(validRecording);
      expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledOnce();
      expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledWith('campaign-1');
      expect(mockRecordingRepository.createRecording).toHaveBeenCalledOnce();

      // Verify the recording was created with correct initial state
      const createdWith = vi.mocked(mockRecordingRepository.createRecording).mock.calls[0][0];
      expect(createdWith.status).toBe('recording');
      expect(createdWith.campaignId).toBe('campaign-1');
      expect(createdWith.sessionId).toBe('session-1');
      expect(createdWith.discordGuildId).toBe('guild-1');
      expect(createdWith.discordChannelId).toBe('channel-1');
      expect(createdWith.audioFilePath).toBeNull();
      expect(createdWith.transcription).toBeNull();
      expect(createdWith.speakers).toEqual(validSpeakerMappings);
    });

    it('should snapshot speaker mappings from campaign at start time', async () => {
      const campaignWithMappings: CampaignI = {
        ...validCampaign,
        discordSpeakerMappings: validSpeakerMappings,
      };
      vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMappings);
      vi.mocked(mockRecordingRepository.createRecording).mockResolvedValue(validRecording);

      await startRecording(
        mockRecordingRepository,
        mockCampaignRepository,
        {
          campaignId: 'campaign-1',
          sessionId: 'session-1',
          discordGuildId: 'guild-1',
          discordChannelId: 'channel-1',
        }
      );

      const createdWith = vi.mocked(mockRecordingRepository.createRecording).mock.calls[0][0];
      expect(createdWith.speakers).toEqual(validSpeakerMappings);
    });

    it('should throw when campaign not found', async () => {
      vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);

      await expect(
        startRecording(
          mockRecordingRepository,
          mockCampaignRepository,
          {
            campaignId: 'nonexistent-campaign',
            sessionId: 'session-1',
            discordGuildId: 'guild-1',
            discordChannelId: 'channel-1',
          }
        )
      ).rejects.toThrow('Campaña no encontrada');

      expect(mockRecordingRepository.createRecording).not.toHaveBeenCalled();
    });

    it('should throw when campaign is finalized', async () => {
      const finalizedCampaign: CampaignI = { ...validCampaign, status: 'Finalizada' };
      vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finalizedCampaign);

      await expect(
        startRecording(
          mockRecordingRepository,
          mockCampaignRepository,
          {
            campaignId: 'campaign-1',
            sessionId: 'session-1',
            discordGuildId: 'guild-1',
            discordChannelId: 'channel-1',
          }
        )
      ).rejects.toThrow('No se pueden realizar cambios en una campaña finalizada');

      expect(mockRecordingRepository.createRecording).not.toHaveBeenCalled();
    });

    it('should throw when session not found in campaign', async () => {
      vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);

      await expect(
        startRecording(
          mockRecordingRepository,
          mockCampaignRepository,
          {
            campaignId: 'campaign-1',
            sessionId: 'nonexistent-session',
            discordGuildId: 'guild-1',
            discordChannelId: 'channel-1',
          }
        )
      ).rejects.toThrow('Sesión con id "nonexistent-session" no encontrada en la campaña');

      expect(mockRecordingRepository.createRecording).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // stopRecording
  // ============================================================

  describe('stopRecording', () => {
    it('should stop recording and save audio successfully (happy path)', async () => {
      const stoppedRecording: RecordingI = {
        ...validRecording,
        status: 'processing',
        audioFilePath: 'campaign-1/session-1/recording-1',
        stoppedAt: new Date(),
        durationSeconds: 3600,
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(validRecording);
      vi.mocked(mockStorageProvider.save).mockResolvedValue('campaign-1/session-1/recording-1/discord-user-1.opus');
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(stoppedRecording);

      const audioData = new Map<string, Buffer>([
        ['discord-user-1', Buffer.from('audio data 1')],
        ['discord-user-2', Buffer.from('audio data 2')],
      ]);

      const result = await stopRecording(
        mockRecordingRepository,
        mockStorageProvider,
        {
          recordingId: 'recording-1',
          audioData,
          durationSeconds: 3600,
        }
      );

      expect(result).toEqual(stoppedRecording);
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledOnce();
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledWith('recording-1');

      // Verify each speaker audio was saved
      expect(mockStorageProvider.save).toHaveBeenCalledTimes(2);
      expect(mockStorageProvider.save).toHaveBeenCalledWith(
        'campaign-1/session-1/recording-1/discord-user-1.opus',
        Buffer.from('audio data 1')
      );
      expect(mockStorageProvider.save).toHaveBeenCalledWith(
        'campaign-1/session-1/recording-1/discord-user-2.opus',
        Buffer.from('audio data 2')
      );

      // Verify updated recording fields
      const updatedWith = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      expect(updatedWith.status).toBe('processing');
      expect(updatedWith.audioFilePath).toBe('campaign-1/session-1/recording-1');
      expect(updatedWith.durationSeconds).toBe(3600);
      expect(updatedWith.stoppedAt).toBeInstanceOf(Date);
    });

    it('should handle empty audioData map', async () => {
      const stoppedRecording: RecordingI = {
        ...validRecording,
        status: 'processing',
        audioFilePath: 'campaign-1/session-1/recording-1',
        stoppedAt: new Date(),
        durationSeconds: null,
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(validRecording);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(stoppedRecording);

      const result = await stopRecording(
        mockRecordingRepository,
        mockStorageProvider,
        {
          recordingId: 'recording-1',
          audioData: new Map(),
        }
      );

      expect(result).toEqual(stoppedRecording);
      expect(mockStorageProvider.save).not.toHaveBeenCalled();
      const updatedWith = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      expect(updatedWith.durationSeconds).toBeNull();
    });

    it('should throw when recording not found', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(null);

      await expect(
        stopRecording(
          mockRecordingRepository,
          mockStorageProvider,
          {
            recordingId: 'nonexistent',
            audioData: new Map(),
          }
        )
      ).rejects.toThrow('Grabación no encontrada');

      expect(mockStorageProvider.save).not.toHaveBeenCalled();
      expect(mockRecordingRepository.updateRecording).not.toHaveBeenCalled();
    });

    it('should throw when recording status is not "recording"', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);

      await expect(
        stopRecording(
          mockRecordingRepository,
          mockStorageProvider,
          {
            recordingId: 'recording-2',
            audioData: new Map(),
          }
        )
      ).rejects.toThrow(
        'No se puede detener una grabación en estado "processing". Estado requerido: "recording"'
      );

      expect(mockStorageProvider.save).not.toHaveBeenCalled();
      expect(mockRecordingRepository.updateRecording).not.toHaveBeenCalled();
    });

    it('should throw when recording status is "failed"', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(failedRecording);

      await expect(
        stopRecording(
          mockRecordingRepository,
          mockStorageProvider,
          {
            recordingId: 'recording-3',
            audioData: new Map(),
          }
        )
      ).rejects.toThrow('Estado requerido: "recording"');
    });
  });

  // ============================================================
  // transcribeRecording
  // ============================================================

  describe('transcribeRecording', () => {
    it('should transcribe recording successfully (happy path)', async () => {
      const audioBuffer = Buffer.from('audio bytes');
      const transcriptionResult = {
        segments: [
          { speakerDiscordUserId: '', speakerLabel: '', text: 'Hello world', startTime: 0, endTime: 2 },
          { speakerDiscordUserId: '', speakerLabel: '', text: 'Goodbye', startTime: 3, endTime: 5 },
        ],
        durationSeconds: 5,
      };

      const transcribedRecording: RecordingI = {
        ...processingRecording,
        status: 'transcribed',
        transcription: [
          { speakerDiscordUserId: 'discord-user-1', speakerLabel: 'Player 1', text: 'Hello world', startTime: 0, endTime: 2 },
          { speakerDiscordUserId: 'discord-user-1', speakerLabel: 'Player 1', text: 'Goodbye', startTime: 3, endTime: 5 },
        ],
        transcriptionProvider: 'mock-transcription-provider',
        transcribedAt: new Date(),
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);
      vi.mocked(mockStorageProvider.get).mockResolvedValue(audioBuffer);
      vi.mocked(mockTranscriptionProvider.transcribe).mockResolvedValue(transcriptionResult);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(transcribedRecording);

      const result = await transcribeRecording(
        mockRecordingRepository,
        mockStorageProvider,
        mockTranscriptionProvider,
        { recordingId: 'recording-2' }
      );

      expect(result).toEqual(transcribedRecording);
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledOnce();
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledWith('recording-2');

      // Verify audio was loaded for each speaker
      expect(mockStorageProvider.get).toHaveBeenCalledTimes(2);
      expect(mockStorageProvider.get).toHaveBeenCalledWith(
        'campaign-1/session-1/recording-2/discord-user-1.opus'
      );
      expect(mockStorageProvider.get).toHaveBeenCalledWith(
        'campaign-1/session-1/recording-2/discord-user-2.opus'
      );

      // Verify transcription provider was called for each speaker with audio
      expect(mockTranscriptionProvider.transcribe).toHaveBeenCalledTimes(2);

      // Verify update was called with success status
      const updatedWith = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      expect(updatedWith.status).toBe('transcribed');
      expect(updatedWith.transcriptionProvider).toBe('mock-transcription-provider');
      expect(updatedWith.transcriptionError).toBeNull();
      expect(updatedWith.transcribedAt).toBeInstanceOf(Date);
    });

    it('should skip speakers with no audio file', async () => {
      const transcriptionResult = {
        segments: [
          { speakerDiscordUserId: '', speakerLabel: '', text: 'Hello', startTime: 0, endTime: 1 },
        ],
        durationSeconds: 1,
      };

      const transcribedRecording: RecordingI = {
        ...processingRecording,
        status: 'transcribed',
        transcription: [
          { speakerDiscordUserId: 'discord-user-1', speakerLabel: 'Player 1', text: 'Hello', startTime: 0, endTime: 1 },
        ],
        transcriptionProvider: 'mock-transcription-provider',
        transcribedAt: new Date(),
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);
      // First speaker has audio, second does not
      vi.mocked(mockStorageProvider.get)
        .mockResolvedValueOnce(Buffer.from('audio'))
        .mockResolvedValueOnce(null);
      vi.mocked(mockTranscriptionProvider.transcribe).mockResolvedValue(transcriptionResult);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(transcribedRecording);

      await transcribeRecording(
        mockRecordingRepository,
        mockStorageProvider,
        mockTranscriptionProvider,
        { recordingId: 'recording-2' }
      );

      // Only one speaker had audio, so transcribe called once
      expect(mockTranscriptionProvider.transcribe).toHaveBeenCalledOnce();
    });

    it('should sort merged segments by startTime', async () => {
      // Speaker 1 returns segment starting at time 5
      const speaker1Result = {
        segments: [{ speakerDiscordUserId: '', speakerLabel: '', text: 'Late', startTime: 5, endTime: 7 }],
        durationSeconds: 7,
      };
      // Speaker 2 returns segment starting at time 0
      const speaker2Result = {
        segments: [{ speakerDiscordUserId: '', speakerLabel: '', text: 'Early', startTime: 0, endTime: 2 }],
        durationSeconds: 7,
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);
      vi.mocked(mockStorageProvider.get).mockResolvedValue(Buffer.from('audio'));
      vi.mocked(mockTranscriptionProvider.transcribe)
        .mockResolvedValueOnce(speaker1Result)
        .mockResolvedValueOnce(speaker2Result);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue({ ...processingRecording, status: 'transcribed', transcription: [] });

      await transcribeRecording(
        mockRecordingRepository,
        mockStorageProvider,
        mockTranscriptionProvider,
        { recordingId: 'recording-2' }
      );

      const updatedWith = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      const segments = updatedWith.transcription!;
      expect(segments[0].startTime).toBe(0);
      expect(segments[1].startTime).toBe(5);
    });

    it('should set status to "failed" when transcription provider throws', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);
      vi.mocked(mockStorageProvider.get).mockResolvedValue(Buffer.from('audio'));
      vi.mocked(mockTranscriptionProvider.transcribe).mockRejectedValue(new Error('Provider timeout'));
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue({
        ...processingRecording,
        status: 'failed',
        transcriptionError: 'Provider timeout',
      });

      await expect(
        transcribeRecording(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-2' }
        )
      ).rejects.toThrow('Provider timeout');

      // Verify update was called with failed status and error message
      const updatedWith = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      expect(updatedWith.status).toBe('failed');
      expect(updatedWith.transcriptionError).toBe('Provider timeout');
    });

    it('should throw when recording not found', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(null);

      await expect(
        transcribeRecording(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'nonexistent' }
        )
      ).rejects.toThrow('Grabación no encontrada');

      expect(mockStorageProvider.get).not.toHaveBeenCalled();
      expect(mockTranscriptionProvider.transcribe).not.toHaveBeenCalled();
    });

    it('should throw when recording status is "recording" (not processing or failed)', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(validRecording);

      await expect(
        transcribeRecording(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-1' }
        )
      ).rejects.toThrow(
        'No se puede transcribir una grabación en estado "recording". Estados permitidos: "processing", "failed"'
      );
    });

    it('should pass language option to transcription provider', async () => {
      const transcriptionResult = {
        segments: [],
        durationSeconds: 0,
      };
      const transcribedRecording: RecordingI = {
        ...processingRecording,
        status: 'transcribed',
        transcription: [],
        transcriptionProvider: 'mock-transcription-provider',
        transcribedAt: new Date(),
      };

      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);
      vi.mocked(mockStorageProvider.get).mockResolvedValue(Buffer.from('audio'));
      vi.mocked(mockTranscriptionProvider.transcribe).mockResolvedValue(transcriptionResult);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(transcribedRecording);

      await transcribeRecording(
        mockRecordingRepository,
        mockStorageProvider,
        mockTranscriptionProvider,
        { recordingId: 'recording-2', language: 'es' }
      );

      expect(mockTranscriptionProvider.transcribe).toHaveBeenCalledWith(
        expect.any(Buffer),
        'es'
      );
    });
  });

  // ============================================================
  // retryTranscription
  // ============================================================

  describe('retryTranscription', () => {
    it('should retry failed transcription successfully (happy path)', async () => {
      const transcriptionResult = {
        segments: [
          { speakerDiscordUserId: '', speakerLabel: '', text: 'Hello', startTime: 0, endTime: 1 },
        ],
        durationSeconds: 1,
      };
      const resetRecording: RecordingI = {
        ...failedRecording,
        status: 'processing',
        transcriptionError: null,
      };
      const transcribedRecording: RecordingI = {
        ...resetRecording,
        status: 'transcribed',
        transcription: [
          { speakerDiscordUserId: 'discord-user-1', speakerLabel: 'Player 1', text: 'Hello', startTime: 0, endTime: 1 },
        ],
        transcriptionProvider: 'mock-transcription-provider',
        transcribedAt: new Date(),
      };

      vi.mocked(mockRecordingRepository.getRecordingById)
        .mockResolvedValueOnce(failedRecording) // retryTranscription fetch
        .mockResolvedValueOnce(resetRecording);  // transcribeRecording fetch (after reset)
      vi.mocked(mockRecordingRepository.updateRecording)
        .mockResolvedValueOnce(resetRecording)      // reset to "processing"
        .mockResolvedValueOnce(transcribedRecording); // final transcribed update
      vi.mocked(mockStorageProvider.get).mockResolvedValue(Buffer.from('audio'));
      vi.mocked(mockTranscriptionProvider.transcribe).mockResolvedValue(transcriptionResult);

      const result = await retryTranscription(
        mockRecordingRepository,
        mockStorageProvider,
        mockTranscriptionProvider,
        { recordingId: 'recording-3' }
      );

      expect(result).toEqual(transcribedRecording);

      // Verify recording was reset to "processing" first
      const firstUpdate = vi.mocked(mockRecordingRepository.updateRecording).mock.calls[0][0];
      expect(firstUpdate.status).toBe('processing');
      expect(firstUpdate.transcriptionError).toBeNull();
    });

    it('should throw when recording not found', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(null);

      await expect(
        retryTranscription(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'nonexistent' }
        )
      ).rejects.toThrow('Grabación no encontrada');

      expect(mockRecordingRepository.updateRecording).not.toHaveBeenCalled();
    });

    it('should throw when recording status is not "failed"', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(processingRecording);

      await expect(
        retryTranscription(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-2' }
        )
      ).rejects.toThrow(
        'Solo se puede reintentar una grabación en estado "failed". Estado actual: "processing"'
      );

      expect(mockRecordingRepository.updateRecording).not.toHaveBeenCalled();
    });

    it('should throw when recording status is "recording"', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(validRecording);

      await expect(
        retryTranscription(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-1' }
        )
      ).rejects.toThrow('Solo se puede reintentar una grabación en estado "failed"');
    });

    it('should throw when recording status is "transcribed"', async () => {
      const transcribedRecording: RecordingI = {
        ...processingRecording,
        status: 'transcribed',
        transcription: [],
        transcriptionProvider: 'mock',
      };
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(transcribedRecording);

      await expect(
        retryTranscription(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-2' }
        )
      ).rejects.toThrow('Solo se puede reintentar una grabación en estado "failed"');
    });

    it('should throw when update to reset state fails', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(failedRecording);
      vi.mocked(mockRecordingRepository.updateRecording).mockResolvedValue(null);

      await expect(
        retryTranscription(
          mockRecordingRepository,
          mockStorageProvider,
          mockTranscriptionProvider,
          { recordingId: 'recording-3' }
        )
      ).rejects.toThrow('Error al restablecer el estado de la grabación');
    });
  });

  // ============================================================
  // getRecording
  // ============================================================

  describe('getRecording', () => {
    it('should return recording by id', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(validRecording);

      const result = await getRecording(mockRecordingRepository, 'recording-1');

      expect(result).toEqual(validRecording);
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledOnce();
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledWith('recording-1');
    });

    it('should return null when recording not found', async () => {
      vi.mocked(mockRecordingRepository.getRecordingById).mockResolvedValue(null);

      const result = await getRecording(mockRecordingRepository, 'nonexistent');

      expect(result).toBeNull();
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledOnce();
      expect(mockRecordingRepository.getRecordingById).toHaveBeenCalledWith('nonexistent');
    });
  });

  // ============================================================
  // getRecordingsBySession
  // ============================================================

  describe('getRecordingsBySession', () => {
    it('should return all recordings for a session', async () => {
      const recordings: RecordingI[] = [validRecording, processingRecording];
      vi.mocked(mockRecordingRepository.getRecordingsBySession).mockResolvedValue(recordings);

      const result = await getRecordingsBySession(
        mockRecordingRepository,
        'campaign-1',
        'session-1'
      );

      expect(result).toEqual(recordings);
      expect(mockRecordingRepository.getRecordingsBySession).toHaveBeenCalledOnce();
      expect(mockRecordingRepository.getRecordingsBySession).toHaveBeenCalledWith(
        'campaign-1',
        'session-1'
      );
    });

    it('should return empty array when no recordings exist for session', async () => {
      vi.mocked(mockRecordingRepository.getRecordingsBySession).mockResolvedValue([]);

      const result = await getRecordingsBySession(
        mockRecordingRepository,
        'campaign-1',
        'empty-session'
      );

      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // setSpeakerMappings (campaign use case)
  // ============================================================

  describe('setSpeakerMappings', () => {
    it('should set speaker mappings successfully (happy path)', async () => {
      const updatedCampaign: CampaignI = {
        ...validCampaign,
        discordSpeakerMappings: validSpeakerMappings,
      };
      vi.mocked(mockCampaignRepository.setSpeakerMappings).mockResolvedValue(updatedCampaign);

      const result = await setSpeakerMappings(
        mockCampaignRepository,
        'campaign-1',
        validSpeakerMappings
      );

      expect(result).toEqual(updatedCampaign);
      expect(mockCampaignRepository.setSpeakerMappings).toHaveBeenCalledOnce();
      expect(mockCampaignRepository.setSpeakerMappings).toHaveBeenCalledWith(
        'campaign-1',
        validSpeakerMappings
      );
    });

    it('should return null when campaign not found', async () => {
      vi.mocked(mockCampaignRepository.setSpeakerMappings).mockResolvedValue(null);

      const result = await setSpeakerMappings(
        mockCampaignRepository,
        'nonexistent-campaign',
        validSpeakerMappings
      );

      expect(result).toBeNull();
    });

    it('should set empty mappings array successfully', async () => {
      const updatedCampaign: CampaignI = { ...validCampaign, discordSpeakerMappings: [] };
      vi.mocked(mockCampaignRepository.setSpeakerMappings).mockResolvedValue(updatedCampaign);

      const result = await setSpeakerMappings(mockCampaignRepository, 'campaign-1', []);

      expect(result).toEqual(updatedCampaign);
      expect(mockCampaignRepository.setSpeakerMappings).toHaveBeenCalledWith('campaign-1', []);
    });

    it('should throw when a mapping has empty discordUserId', async () => {
      const invalidMappings: SpeakerMapping[] = [
        {
          discordUserId: '',
          discordUsername: 'Player1',
          characterId: null,
          characterName: null,
          label: 'Player 1',
          role: 'player',
        },
      ];

      await expect(
        setSpeakerMappings(mockCampaignRepository, 'campaign-1', invalidMappings)
      ).rejects.toThrow('El discordUserId del speaker es requerido');

      expect(mockCampaignRepository.setSpeakerMappings).not.toHaveBeenCalled();
    });

    it('should throw when a mapping has empty discordUsername', async () => {
      const invalidMappings: SpeakerMapping[] = [
        {
          discordUserId: 'user-1',
          discordUsername: '',
          characterId: null,
          characterName: null,
          label: 'Player 1',
          role: 'player',
        },
      ];

      await expect(
        setSpeakerMappings(mockCampaignRepository, 'campaign-1', invalidMappings)
      ).rejects.toThrow('El discordUsername del speaker es requerido');

      expect(mockCampaignRepository.setSpeakerMappings).not.toHaveBeenCalled();
    });

    it('should throw when a mapping has empty label', async () => {
      const invalidMappings: SpeakerMapping[] = [
        {
          discordUserId: 'user-1',
          discordUsername: 'Player1',
          characterId: null,
          characterName: null,
          label: '',
          role: 'player',
        },
      ];

      await expect(
        setSpeakerMappings(mockCampaignRepository, 'campaign-1', invalidMappings)
      ).rejects.toThrow('El label del speaker es requerido');

      expect(mockCampaignRepository.setSpeakerMappings).not.toHaveBeenCalled();
    });

    it('should throw when a mapping has invalid role', async () => {
      const invalidMappings = [
        {
          discordUserId: 'user-1',
          discordUsername: 'Player1',
          characterId: null,
          characterName: null,
          label: 'Player 1',
          role: 'invalid-role' as 'player',
        },
      ];

      await expect(
        setSpeakerMappings(mockCampaignRepository, 'campaign-1', invalidMappings)
      ).rejects.toThrow("El role del speaker debe ser 'player' o 'dm'");

      expect(mockCampaignRepository.setSpeakerMappings).not.toHaveBeenCalled();
    });

    it('should validate all mappings in the array (fail on second invalid)', async () => {
      const mixedMappings: SpeakerMapping[] = [
        // First is valid
        {
          discordUserId: 'user-1',
          discordUsername: 'Player1',
          characterId: null,
          characterName: null,
          label: 'Player 1',
          role: 'player',
        },
        // Second has empty discordUserId
        {
          discordUserId: '',
          discordUsername: 'Player2',
          characterId: null,
          characterName: null,
          label: 'Player 2',
          role: 'player',
        },
      ];

      await expect(
        setSpeakerMappings(mockCampaignRepository, 'campaign-1', mixedMappings)
      ).rejects.toThrow('El discordUserId del speaker es requerido');

      expect(mockCampaignRepository.setSpeakerMappings).not.toHaveBeenCalled();
    });
  });
});
