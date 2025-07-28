import { createCampaign, getAllCampaigns } from '@/application/useCases/campaign';
import { campaignRepository } from '@/infrastructure/adapters/repositories/campaign.repository';
import { campaignSchema } from '@/infrastructure/campaign/schema';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
    const campaigns = await getAllCampaigns(campaignRepository);
    return NextResponse.json(campaigns);
}

// CREATE CAMPAIGN
export async function POST(req: NextRequest) {
    const body = await req.json();
    // Validate the body against the campaign schema
    const campaign = campaignSchema.parse(body);
    const createdCampaign = await createCampaign(campaignRepository, campaign);
    return NextResponse.json(createdCampaign, { status: 201 });
}

