import { Mission } from "../entities/mission";

export interface MissionRespository {
    getAllMissions(): Promise<Mission[]>;
    getMissionById(id: string): Promise<Mission | null>;
    createMission(mission: Omit<Mission, "id">): Promise<Mission>;
    updateMission(mission: Mission): Promise<Mission | null>;
    deleteMission(id: string): Promise<boolean>;
}