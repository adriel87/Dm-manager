import { NextResponse } from "next/server";

/**
 * DEPRECATED: Missions are now managed as embedded entities within Campaign aggregate.
 * Use /api/campaign/[campaignId]/missions/[missionId] instead.
 * 
 * FR-18: Return 410 Gone to indicate this endpoint is permanently deprecated.
 */
export async function GET() {
    return NextResponse.json(
        {
            error: "Missions are now managed via /api/campaign/[campaignId]/missions",
            movedTo: "/api/campaign/{campaignId}/missions/{missionId}"
        },
        { status: 410 }
    );
}

export async function PUT() {
    return NextResponse.json(
        {
            error: "Missions are now managed via /api/campaign/[campaignId]/missions",
            movedTo: "/api/campaign/{campaignId}/missions/{missionId}"
        },
        { status: 410 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        {
            error: "Missions are now managed via /api/campaign/[campaignId]/missions",
            movedTo: "/api/campaign/{campaignId}/missions/{missionId}"
        },
        { status: 410 }
    );
}