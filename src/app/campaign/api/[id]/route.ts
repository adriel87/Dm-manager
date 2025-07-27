import { getCollection } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const collection = await getCollection('campaigns');
    const id = (await params).id;
    const campaign = await collection.findOne({ _id: new ObjectId(id) });
    if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
}