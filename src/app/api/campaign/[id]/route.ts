import { getCampaignById, updateCampaign } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const campaign = await getCampaignById(repositories.campaign, id);
    if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
}

// UPDATE CAMPAIGN
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const body = await req.json();

    // Validate the body against the campaign schema (only root fields)
    const validatedData = campaignSchema.parse(body);
    
    // Fetch existing campaign to preserve embedded collections
    const existingCampaign = await getCampaignById(repositories.campaign, id);
    if (!existingCampaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    // Update only root fields, preserve embedded collections
    const updatedCampaign = await updateCampaign(repositories.campaign, {
        ...existingCampaign,
        ...validatedData,
        id, // Ensure id is preserved
    });

    if (!updatedCampaign) {
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
    return NextResponse.json(updatedCampaign);
}

// DELETE CAMPAIGN
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {   
    const id = (await params).id;
    const isDeleted = await repositories.campaign.deleteCampaign(id);
    return NextResponse.json({ message: isDeleted ? 'Campaign deleted successfully' : 'Failed to delete campaign' });
}