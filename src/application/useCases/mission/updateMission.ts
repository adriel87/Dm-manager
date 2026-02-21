import { Mission, updateMissionParams } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";


export const updateMission = async (repository: MissionRespository, missionData: Partial<Mission>): Promise<Mission | null> => {
    try {
        if (!missionData.id) {
            throw new Error("Invalid mission data or ID");
        }
        let mission : Mission | null = await repository.getMissionById(missionData.id); 
        if (mission) {
            updateMissionParams(mission,missionData)
            return await repository.updateMission(mission);
        } else {
            throw new Error("Not found mission by supply id")
        }

    } catch (error) {
        console.error("Error updating mission:", error);
        throw new Error("Failed to update mission");
    }
}