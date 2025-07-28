import { Mission } from "@/domain/entities/mission";
import { MissionRespository } from "@/domain/repositories/MissionRepository";

export const createMission = async (repository: MissionRespository, missionData: Omit<Mission, "id">): Promise<Mission> => {
    try {
        const newMission = await repository.createMission(missionData);
        return newMission;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw new Error("Failed to create mission");
    }
}