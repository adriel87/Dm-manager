import { campaignSchema } from '@/campaign/schema';
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

// CREATE CAMPAIGN
export async function POST(req: NextRequest) {
    const collection = await getCollection('campaigns');
    const body = await req.json();

    // Validate the body against the campaign schema
    const campaign = campaignSchema.parse(body);

    // Insert the new campaign into the database
    const result = await collection.insertOne(campaign);

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
}