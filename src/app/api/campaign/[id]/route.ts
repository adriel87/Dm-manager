import { getCampaignById, updateCampaign } from '@/application/useCases/campaign';
import { campaignRepository } from '@/infrastructure/adapters/repositories/mongo/campaign.repository';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const campaign = await getCampaignById(campaignRepository, id);
    if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
}

// UPDATE CAMPAIGN
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const body = await req.json();

    // Validate the body against the campaign schema
    const campaign = campaignSchema.parse(body);
    // Check if the campaign exists
    updateCampaign(campaignRepository, { id, ...campaign });
}

// DELETE CAMPAIGN
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {   
    const id = (await params).id;
    const isDeleted = await campaignRepository.deleteCampaign(id);
    return NextResponse.json({ message: isDeleted ? 'Campaign deleted successfully' : 'Failed to delete campaign' });
}