import { Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";

export const getMissionById = async (repository: MissionRespository, id: string): Promise<Mission | null> => {
    try {
        const mission = await repository.getMissionById(id);
        return mission;
    } catch (error) {
        console.error("Error fetching mission by ID:", error);
        throw new Error("Failed to fetch mission by ID");
    }
}