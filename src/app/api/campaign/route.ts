import { createCampaign, getAllCampaigns } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';
import type { CampaignI } from '@/domain/campaign/campaign';


export async function GET() {
    const campaigns = await getAllCampaigns(repositories.campaign);
    
    // Transform campaigns for list view: include counts, exclude full arrays
    const campaignsWithCounts = campaigns.map(campaign => ({
        ...campaign,
        sessionCount: campaign.sessions.length,
        missionCount: campaign.missions.length,
        // Exclude full missions and sessions arrays for performance
        missions: undefined,
        sessions: undefined,
    }));
    
    return NextResponse.json(campaignsWithCounts);
}

// CREATE CAMPAIGN
export async function POST(req: NextRequest) {
    const body = await req.json();
    // Validate the body against the campaign schema (only root fields: name, description, status)
    const validatedData = campaignSchema.parse(body);
    
    const createdCampaign = await createCampaign(repositories.campaign, validatedData as Omit<CampaignI, 'id'>);
    return NextResponse.json(createdCampaign, { status: 201 });
}

