import { createCharacter } from "@/application/useCases/character/createCharacter";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { characterSchema } from "@/infrastructure/adapters/schemas/character.schema";

export async function POST(req: Request) {
    const character = await req.json();
    const validatedCharacter = characterSchema.parse(character);
    const createdCharacter = await createCharacter(characterRepository, validatedCharacter);
    if (!createdCharacter) {
        return new Response("Character creation failed", { status: 400 });
    }
    return new Response(JSON.stringify(createdCharacter), { status: 201 });
}