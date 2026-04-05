import { RecordingI } from "@/domain/recording/recording";
import { RecordingRepository } from "@/domain/recording/RecordingRepository";

let store: Map<string, RecordingI> = new Map();

export const recordingMemoryRepository: RecordingRepository = {
  getRecordingById: async (id: string) => {
    return store.get(id) ?? null;
  },

  getRecordingsBySession: async (campaignId: string, sessionId: string) => {
    return Array.from(store.values()).filter(
      (r) => r.campaignId === campaignId && r.sessionId === sessionId,
    );
  },

  getRecordingsByCampaign: async (campaignId: string) => {
    return Array.from(store.values()).filter(
      (r) => r.campaignId === campaignId,
    );
  },

  createRecording: async (recording: Omit<RecordingI, "id">) => {
    const id = crypto.randomUUID();
    const created: RecordingI = {
      ...recording,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.set(id, created);
    return created;
  },

  updateRecording: async (recording: RecordingI) => {
    if (!store.has(recording.id)) return null;
    const updated: RecordingI = {
      ...recording,
      updatedAt: new Date(),
    };
    store.set(recording.id, updated);
    return updated;
  },

  deleteRecording: async (id: string) => {
    return store.delete(id);
  },
};

export const resetRecordingStore = () => {
  store = new Map();
};
