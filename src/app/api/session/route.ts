import { createSession } from "@/application/useCases/session";
import { repositories } from "@/infrastructure/config/repositories";
import { sessionSchema } from "@/infrastructure/adapters/schemas/session.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sessions = await repositories.session.getAllSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = sessionSchema.parse(body);
  const created = await createSession(repositories.session, session);
  return NextResponse.json(created, { status: 201 });
}
