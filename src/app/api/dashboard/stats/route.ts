import { getDashboardStats } from '@/application/useCases/dashboard';
import { repositories } from '@/infrastructure/config/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
    const stats = await getDashboardStats(repositories.dashboard);
    return NextResponse.json(stats);
}
