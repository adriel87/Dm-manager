import { Mission } from "@/domain/mission/mission";
import { MissionRepository } from "@/domain/mission/MissionRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { mapMissionFromMongoToDomain } from "../../mappers/mission.mapper";
import { ObjectId } from "mongodb";

export const missionRepository: MissionRepository = {
    getAllMissions: async () => {
        const missions = await getCollection('missions');
        const missionsList = (await missions.find({}).toArray()).map(mission => mapMissionFromMongoToDomain(mission));
        return missionsList;
    },
    getMissionById: async (id: string): Promise<Mission | null> => {
        const collection = await getCollection('missions');
        const mission = await collection.findOne({ _id: new ObjectId(id) });
        return mission ? mapMissionFromMongoToDomain(mission) : null;
    },
    createMission: async (mission: Omit<Mission, "id">): Promise<Mission> => {
        const collection = await getCollection("missions")
        const result = await collection.insertOne({
            ...mission,
            startDate: mission.startDate,
            endDate: mission.endDate,
            status: mission.status
        });
        return {
            id: result.insertedId.toString(), // Convert ObjectId to string
            ...mission
        }
    },
    updateMission: async (mission: Mission): Promise<Mission | null> => {
        const missions = await getCollection('missions');
        await missions.updateOne({ _id: new ObjectId(mission.id) }, { $set: mission });
        return mission;
         
    },
    deleteMission: async (id: string): Promise<boolean> => {
        const missions = await getCollection('missions');
        const result = await missions.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}