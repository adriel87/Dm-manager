import {
  CampaignI,
  CharacterRef,
  EmbeddedItem,
  EmbeddedMission,
  EmbeddedNote,
  EmbeddedSession,
  GroupSnapshot,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { SpeakerMapping } from "@/domain/recording/recording";

let store: CampaignI[] = [];
let nextId = 1;

export const campaignMemoryRepository: CampaignRepository = {
  // ========================================
  // Root Entity Operations
  // ========================================
  getAllCampaigns: async () => [...store],

  getCampaignById: async (id) => store.find((c) => c.id === id) ?? null,

  createCampaign: async (campaign) => {
    const created = {
      ...campaign,
      id: String(nextId++),
      missions: [],
      sessions: [],
      notes: [],
      characters: [],
      group: null,
      inventory: campaign.inventory ?? { items: [], capacity: 100, money: 0 },
      discordSpeakerMappings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.push(created);
    return created;
  },

  updateCampaign: async (campaign) => {
    const index = store.findIndex((c) => c.id === campaign.id);
    if (index === -1) return null;

    // Only update root-level fields, preserve aggregate collections
    const existing = store[index];
    store[index] = {
      ...existing,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      nextSessionAt: campaign.nextSessionAt,
      lastSessionAt: campaign.lastSessionAt,
      updatedAt: new Date(),
    };
    return store[index];
  },

  deleteCampaign: async (id) => {
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },

  // ========================================
  // Mission Sub-Document Operations
  // ========================================
  addMission: async (campaignId: string, mission: EmbeddedMission) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.missions.push(mission);
    campaign.updatedAt = new Date();
    return campaign;
  },

  updateMission: async (campaignId: string, mission: EmbeddedMission) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    const missionIndex = campaign.missions.findIndex((m) => m.id === mission.id);
    if (missionIndex === -1) return null;

    campaign.missions[missionIndex] = mission;
    campaign.updatedAt = new Date();
    return campaign;
  },

  removeMission: async (campaignId: string, missionId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.missions = campaign.missions.filter((m) => m.id !== missionId);
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Session Sub-Document Operations
  // ========================================
  addSession: async (campaignId: string, session: EmbeddedSession) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.sessions.push(session);
    campaign.updatedAt = new Date();
    return campaign;
  },

  updateSession: async (campaignId: string, session: EmbeddedSession) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    const sessionIndex = campaign.sessions.findIndex((s) => s.id === session.id);
    if (sessionIndex === -1) return null;

    campaign.sessions[sessionIndex] = session;
    campaign.updatedAt = new Date();
    return campaign;
  },

  removeSession: async (campaignId: string, sessionId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.sessions = campaign.sessions.filter((s) => s.id !== sessionId);
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Character Sub-Document Operations
  // ========================================
  addCharacter: async (campaignId: string, character: CharacterRef) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    // Deduplicate: only add if character not already present
    const exists = campaign.characters.some((c) => c.id === character.id);
    if (!exists) {
      campaign.characters.push(character);
      campaign.updatedAt = new Date();
    }
    return campaign;
  },

  removeCharacter: async (campaignId: string, characterId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.characters = campaign.characters.filter((c) => c.id !== characterId);
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Group Sub-Document Operations
  // ========================================
  assignGroup: async (campaignId: string, group: GroupSnapshot) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.group = group;
    campaign.updatedAt = new Date();
    return campaign;
  },

  removeGroup: async (campaignId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.group = null;
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Inventory Sub-Document Operations
  // ========================================
  addInventoryItem: async (campaignId: string, item: EmbeddedItem) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.inventory.items.push(item);
    campaign.updatedAt = new Date();
    return campaign;
  },

  updateInventoryItem: async (campaignId: string, item: EmbeddedItem) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    const index = campaign.inventory.items.findIndex((i) => i.id === item.id);
    if (index === -1) return null;

    campaign.inventory.items[index] = item;
    campaign.updatedAt = new Date();
    return campaign;
  },

  removeInventoryItem: async (campaignId: string, itemId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.inventory.items = campaign.inventory.items.filter((i) => i.id !== itemId);
    campaign.updatedAt = new Date();
    return campaign;
  },

  incrementInventoryMoney: async (campaignId: string, delta: number) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.inventory.money += delta;
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Note Sub-Document Operations
  // ========================================
  addNote: async (campaignId: string, note: EmbeddedNote) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.notes.push(note);
    campaign.updatedAt = new Date();
    return campaign;
  },

  removeNote: async (campaignId: string, noteId: string) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.notes = campaign.notes.filter((n) => n.id !== noteId);
    campaign.updatedAt = new Date();
    return campaign;
  },

  // ========================================
  // Discord Speaker Mapping Operations
  // ========================================
  setSpeakerMappings: async (campaignId: string, mappings: SpeakerMapping[]) => {
    const campaign = store.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.discordSpeakerMappings = mappings;
    campaign.updatedAt = new Date();
    return campaign;
  },
};

export const resetCampaignStore = () => {
  store = [];
  nextId = 1;
};
