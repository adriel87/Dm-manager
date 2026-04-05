import { Mission, validateMission } from "@/domain/mission/mission";
import { MissionRepository } from "@/domain/mission/MissionRepository";

export const createMission = async (repository: MissionRepository, mission: Omit<Mission, "id">): Promise<Mission> => {
    
    validateMission(mission);

    const createMission = await repository.createMission(mission);

    return createMission;
 
}