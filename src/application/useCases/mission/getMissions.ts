import { Mission } from "@/domain/mission/mission";
import { MissionRepository } from "@/domain/mission/MissionRepository";

export const getAllMissions = async (repository: MissionRepository): Promise<Mission[]> => {
    try {
        const missions = await repository.getAllMissions();
        return missions;
    } catch (error) {
        console.error("Error fetching missions:", error);
        throw new Error("Failed to fetch missions");
    }
}