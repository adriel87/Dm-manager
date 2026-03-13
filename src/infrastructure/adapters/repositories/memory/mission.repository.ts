import { Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

let store: Mission[] = [];
let nextId = 1;

export const missionMemoryRepository: MissionRespository = {
  getAllMissions: async () => [...store],

  getMissionById: async (id) => store.find((m) => m.id === id) ?? null,

  createMission: async (mission) => {
    const created: Mission = { ...mission, id: String(nextId++) };
    store.push(created);
    return created;
  },

  updateMission: async (mission) => {
    const index = store.findIndex((m) => m.id === mission.id);
    if (index === -1) return null;
    store[index] = mission;
    return mission;
  },

  deleteMission: async (id) => {
    const index = store.findIndex((m) => m.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },
};

export const resetMissionStore = () => {
  store = [];
  nextId = 1;
};
