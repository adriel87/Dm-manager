import { deleteMission, getMissionById, updateMission } from "@/application/useCases/mission";
import { missionRepository } from "@/infrastructure/adapters/repositories/mongo/mission.repository";
import { missionSchema } from "@/infrastructure/adapters/schemas/mission.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    const mission = await getMissionById(missionRepository, id);
    if (!mission) {
        return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(mission);
}
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    const body = await request.json();

    // Validate the body against the mission schema
    const mission = missionSchema.parse(body);
    // Check if the mission exists
    const updatedMission = await updateMission(missionRepository, { id, ...mission });
    return NextResponse.json(updatedMission);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    const isDeleted = await deleteMission(missionRepository, id);
    return NextResponse.json({ message: isDeleted ? 'Mission deleted successfully' : 'Failed to delete mission' });
}