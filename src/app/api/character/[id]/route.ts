import { deleteCharacter } from "@/application/useCases/character/deleteCharacter";
import { getCharacterById } from "@/application/useCases/character/getCharacter";
import { updateCharacter } from "@/application/useCases/character/updateCharacter";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { characterSchema } from "@/infrastructure/adapters/schemas/character.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const character = await getCharacterById(characterRepository, id);
    return NextResponse.json(character);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const data = characterSchema.partial().parse(body);
    const updated = await updateCharacter(characterRepository, id, data);
    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await deleteCharacter(characterRepository, id);
    return NextResponse.json({ message: "Character deleted successfully" });
}
