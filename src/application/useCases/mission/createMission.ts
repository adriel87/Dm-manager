import { createNewMission, Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

export const createMission = async (repository: MissionRespository, missionData: Omit<Mission, "id" | "startDate"| "endDate">): Promise<Mission> => {
    try {
        const newMission = createNewMission(missionData)
        return repository.createMission(newMission);;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw new Error("Failed to create mission");
    }
}