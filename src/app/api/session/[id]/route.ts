import { deleteSession, getSessionById, updateSession } from "@/application/useCases/session";
import { repositories } from "@/infrastructure/config/repositories";
import { sessionSchema } from "@/infrastructure/adapters/schemas/session.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionById(repositories.session, id);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = sessionSchema.partial().parse(body);
  const updated = await updateSession(repositories.session, { ...data, id });
  if (!updated) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteSession(repositories.session, id);
  return NextResponse.json({ message: "Session deleted successfully" });
}
