import { getRecentGroups } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '5', 10);
    const groups = await getRecentGroups(repositories.dashboard, limit);
    return NextResponse.json(groups);
}
