import { createMission, getAllMissions } from "@/application/useCases/mission";
import { missionRepository } from "@/infrastructure/adapters/repositories/mongo/mission.repository";
import { missionSchema } from "@/infrastructure/adapters/schemas/mission.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const missions = await getAllMissions(missionRepository);
    return NextResponse.json(missions);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const mission = missionSchema.parse(body);
    const createdMission = await createMission(missionRepository, mission);
    return NextResponse.json(createdMission, { status: 201 });
}