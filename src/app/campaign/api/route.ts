import { getCollection } from '@/lib/mongo';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
    const collection = await getCollection('campaigns');
    const campaignsList  = await collection.find({}).toArray();
    if (!campaignsList || campaignsList.length === 0) {
        return NextResponse.json({ error: 'No campaigns found' }, { status: 404 });
    }

    return NextResponse.json(campaignsList);
}