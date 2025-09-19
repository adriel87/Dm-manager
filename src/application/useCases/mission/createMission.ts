import { Mission, validateMission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

export const createMission = async (repository: MissionRespository, mission: Omit<Mission, "id">): Promise<Mission> => {
    
    validateMission(mission);

    const createMission = await repository.createMission(mission);

    return createMission;
 
}