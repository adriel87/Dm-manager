import { Session } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";

let store: Session[] = [];
let nextId = 1;

export const sessionMemoryRepository: SessionRepository = {
  getAllSessions: async () => [...store],

  getSessionsByCampaign: async (campaignId) =>
    store.filter((s) => s.campaignId === campaignId),

  getSessionById: async (id) => store.find((s) => s.id === id) ?? null,

  createSession: async (session) => {
    const created: Session = { ...session, id: String(nextId++) };
    store.push(created);
    return created;
  },

  updateSession: async (session) => {
    const index = store.findIndex((s) => s.id === session.id);
    if (index === -1) return null;
    store[index] = session;
    return session;
  },

  deleteSession: async (id) => {
    const index = store.findIndex((s) => s.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },
};

export const resetSessionStore = () => {
  store = [];
  nextId = 1;
};
