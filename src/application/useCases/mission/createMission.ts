import { Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

export const createMission = async (repository: MissionRespository, missionData: Omit<Mission, "id">): Promise<Mission> => {
    try {
        const newMission = await repository.createMission(missionData);
        return newMission;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw new Error("Failed to create mission");
    }
}