import { Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

export const getMissionById = async (repository: MissionRespository, id: string): Promise<Mission | null> => {

    if (id === null || id === undefined || id === '') throw new Error('Invalid group id');

    const mission = await repository.getMissionById(id);
    
    return mission;

}