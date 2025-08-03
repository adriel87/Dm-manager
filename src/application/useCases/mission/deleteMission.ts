import { MissionRespository } from "@/domain/mission/MissionRepository";

export const deleteMission = async (repository: MissionRespository, id: string): Promise<boolean> => {
    try {
        const result = await repository.deleteMission(id);
        return result;
    } catch (error) {
        console.error("Error deleting mission:", error);
        throw new Error("Failed to delete mission");
    }
}