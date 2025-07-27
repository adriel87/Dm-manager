import { campaignSchema } from '@/campaign/schema';
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

// UPDATE CAMPAIGN
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const collection = await getCollection('campaigns');
    const id = (await params).id;
    const body = await req.json();

    // Validate the body against the campaign schema
    const campaign = campaignSchema.parse(body);
    // Check if the campaign exists
    const existingCampaign = await collection.findOne({ _id: new ObjectId(id) });

    if (!existingCampaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }  

    // Add the updatedAt field
    campaign.updatedAt = new Date();    
    
    // Update the campaign in the database
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: campaign });

    if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Campaign updated successfully' });
}

// DELETE CAMPAIGN
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {   
    const collection = await getCollection('campaigns');
    const id = (await params).id;

    // Check if the campaign exists
    const existingCampaign = await collection.findOne({ _id: new ObjectId(id) });

    if (!existingCampaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete the campaign from the database
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' });
}