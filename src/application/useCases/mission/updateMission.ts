import { Mission, updateMissionParams } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";


export const updateMission = async (repository: MissionRespository, missionData: Mission): Promise<Mission | null> => {
   
        if (!missionData.id) {
            throw new Error("Invalid mission data or ID");
        }
        const updatedMission = await repository.updateMission(missionData);
        return updatedMission;
  
}