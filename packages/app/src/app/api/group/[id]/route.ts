import { deleteGroup, getGroupById, updateGroup } from '@/application/useCases/group';
import { repositories } from '@/infrastructure/config/repositories';
import { groupSchema } from '@/infrastructure/adapters/schemas/group.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const group = await getGroupById(repositories.group, id);
    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json(group);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const data = groupSchema.partial().parse(body);
    const updated = await updateGroup(repositories.group, id, data);
    if (!updated) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isDeleted = await deleteGroup(repositories.group, id);
    return NextResponse.json({ message: isDeleted ? 'Group deleted successfully' : 'Failed to delete group' });
}
