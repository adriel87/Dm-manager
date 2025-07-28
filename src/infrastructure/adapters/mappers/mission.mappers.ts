import { Mission } from "@/domain/entities/mission";
import { Document, WithId } from "mongodb";

export const mapMissionFromMongoToDomain = (mission: WithId<Document>): Mission =>( {
        id: mission._id.toString(),
        description: mission.description,
        status: mission.status,
        endDate: mission.endDate,
        startDate: mission.startDate,
        name: mission.name
})