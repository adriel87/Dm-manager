import { MissionRepository } from "@/domain/mission/MissionRepository";

export const deleteMission = async (repository: MissionRepository, id: string): Promise<boolean> => {

    if (id === null || id === undefined || id === '') throw new Error('Invalid group id');
  
    const deletedMision = await repository.deleteMission(id);
   
    return deletedMision;
}