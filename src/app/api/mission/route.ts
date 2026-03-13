import { createMission, getAllMissions } from "@/application/useCases/mission";
import { repositories } from "@/infrastructure/config/repositories";
import { missionSchema } from "@/infrastructure/adapters/schemas/mission.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const missions = await getAllMissions(repositories.mission);
    return NextResponse.json(missions);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const mission = missionSchema.parse(body);
    const createdMission = await createMission(repositories.mission, mission);
    return NextResponse.json(createdMission, { status: 201 });
}