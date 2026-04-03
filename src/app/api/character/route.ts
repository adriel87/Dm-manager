import { createCharacter } from "@/application/useCases/character/createCharacter";
import { getAllCharacters } from "@/application/useCases/character/getAllCharacters";
import { repositories } from "@/infrastructure/config/repositories";
import { characterSchema } from "@/infrastructure/adapters/schemas/character.schema";

export async function POST(req: Request) {
    const character = await req.json();
    const validatedCharacter = characterSchema.parse(character);
    const createdCharacter = await createCharacter(repositories.character, validatedCharacter);
    if (!createdCharacter) {
        return new Response("Character creation failed", { status: 400 });
    }
    return new Response(JSON.stringify(createdCharacter), { status: 201 });
}

export async function GET(){
    const characters = await getAllCharacters(repositories.character)
    if (characters) {
        return new Response(JSON.stringify(characters), {status: 200})
    }
    return new Response(JSON.stringify({ error: 'Characters not found' }), { status: 404 })
}