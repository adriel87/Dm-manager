import { createSession } from "@/application/useCases/session";
import { sessionRepository } from "@/infrastructure/adapters/repositories/mongo/session.repository";
import { sessionSchema } from "@/infrastructure/adapters/schemas/session.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sessions = await sessionRepository.getAllSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = sessionSchema.parse(body);
  const created = await createSession(sessionRepository, session);
  return NextResponse.json(created, { status: 201 });
}
