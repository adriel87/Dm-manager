import { createCampaign, getAllCampaigns } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
    const campaigns = await getAllCampaigns(repositories.campaign);
    return NextResponse.json(campaigns);
}

// CREATE CAMPAIGN
export async function POST(req: NextRequest) {
    const body = await req.json();
    // Validate the body against the campaign schema
    const campaign = campaignSchema.parse(body);
    const createdCampaign = await createCampaign(repositories.campaign, campaign);
    return NextResponse.json(createdCampaign, { status: 201 });
}

