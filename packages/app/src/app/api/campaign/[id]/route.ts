import { getCampaignById, updateCampaign, deleteCampaign } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';
import type { CampaignI } from '@/domain/campaign/campaign';


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

    const validatedData = campaignSchema.parse(body);

    try {
        const updatedCampaign = await updateCampaign(repositories.campaign, { ...validatedData, id } as CampaignI);
        return NextResponse.json(updatedCampaign);
    } catch (e) {
        if (e instanceof Error && e.message === 'Campaign not found') {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}

// DELETE CAMPAIGN
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {   
    const id = (await params).id;
    const isDeleted = await deleteCampaign(repositories.campaign, id);
    return NextResponse.json({ message: isDeleted ? 'Campaign deleted successfully' : 'Failed to delete campaign' });
}