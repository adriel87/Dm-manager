import { Mission } from "./mission";

export interface MissionRespository {
    getAllMissions(): Promise<Mission[]>;
    getMissionById(id: string): Promise<Mission | null>;
    createMission(mission: Omit<Mission, "id">): Promise<Mission>;
    updateMission(mission: Mission): Promise<Mission | null>;
    deleteMission(id: string): Promise<boolean>;
}