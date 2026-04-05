import { NextResponse } from "next/server";

/**
 * DEPRECATED: Sessions are now managed as embedded entities within Campaign aggregate.
 * Use /api/campaign/[campaignId]/sessions/[sessionId] instead.
 * 
 * FR-19: Return 410 Gone to indicate this endpoint is permanently deprecated.
 */
export async function GET() {
    return NextResponse.json(
        {
            error: "Sessions are now managed via /api/campaign/[campaignId]/sessions",
            movedTo: "/api/campaign/{campaignId}/sessions/{sessionId}"
        },
        { status: 410 }
    );
}

export async function PUT() {
    return NextResponse.json(
        {
            error: "Sessions are now managed via /api/campaign/[campaignId]/sessions",
            movedTo: "/api/campaign/{campaignId}/sessions/{sessionId}"
        },
        { status: 410 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        {
            error: "Sessions are now managed via /api/campaign/[campaignId]/sessions",
            movedTo: "/api/campaign/{campaignId}/sessions/{sessionId}"
        },
        { status: 410 }
    );
}
