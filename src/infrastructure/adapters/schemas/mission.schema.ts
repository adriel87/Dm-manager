import { MissionStatus } from "@/domain/mission/mission";
import { z } from "zod";

export const missionSchema =  z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    status: z.enum(MissionStatus).default(MissionStatus.Activa),
    startDate: z.date(),
    endDate: z.date()
});