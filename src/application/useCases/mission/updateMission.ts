import { Mission } from "@/domain/entities/mission";
import { MissionRespository } from "@/domain/repositories/MissionRepository";


export const updateMission = async (repository: MissionRespository, missionData: Mission): Promise<Mission | null> => {
    try {
        if (!missionData.id) {
            throw new Error("Invalid mission data or ID");
        }
        const updatedMission = await repository.updateMission(missionData);
        return updatedMission;
    } catch (error) {
        console.error("Error updating mission:", error);
        throw new Error("Failed to update mission");
    }
}