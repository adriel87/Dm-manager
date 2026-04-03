import { Mission } from "@/domain/mission/mission";
import { MissionRepository } from "@/domain/mission/MissionRepository";


export const updateMission = async (repository: MissionRepository, missionData: Mission): Promise<Mission | null> => {
   
        if (!missionData.id) {
            throw new Error("Invalid mission data or ID");
        }
        const updatedMission = await repository.updateMission(missionData);
        return updatedMission;
  
}