import { deleteMission, getMissionById, updateMission } from "@/application/useCases/mission";
import { repositories } from "@/infrastructure/config/repositories";
import { missionSchema } from "@/infrastructure/adapters/schemas/mission.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const mission = await getMissionById(repositories.mission, id);
    if (!mission) {
        return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(mission);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   const id = (await params).id;
    const body = await req.json();

    // Validate the body against the mission schema
    const mission = missionSchema.parse(body);
    // Check if the mission exists
    const updatedMission = await updateMission(repositories.mission, { id, ...mission });
    return NextResponse.json(updatedMission);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {  
    const id = (await params).id;
    const isDeleted = await deleteMission(repositories.mission, id);
    return NextResponse.json({ message: isDeleted ? 'Mission deleted successfully' : 'Failed to delete mission' });
}