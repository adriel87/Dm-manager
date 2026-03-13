import { createGroup, getAllGroups } from '@/application/useCases/group';
import { repositories } from '@/infrastructure/config/repositories';
import { groupSchema } from '@/infrastructure/adapters/schemas/group.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const groups = await getAllGroups(repositories.group);
    return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const group = groupSchema.parse(body);
    const createdGroup = await createGroup(repositories.group, group);
    return NextResponse.json(createdGroup, { status: 201 });
}
