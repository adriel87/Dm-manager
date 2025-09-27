import { Character, DnDClassEnum } from "@/domain/character/character";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { NextResponse } from "next/server";

//CHARACTER
const characterData: Omit<Character, 'id'> = {
    name: 'Bárbara',
    age: "adult",
    classType: DnDClassEnum.Barbarian,
    level: 10,
    hitPoints: 50,
    createdAt: new Date('2025-09-20'),
    updatedAt: undefined,
    description: 'A fierce barbarian warrior',
    location: 'The Northern Wastes',
    isNPC: true
}
export async function POST() {
    try {
        await characterRepository.createCharacter(characterData)
        return NextResponse.json({
            message: 'seed executed',

        });
    } catch (error) {
        return NextResponse.json(
            {
                message: 'Failed to execute seed',
                error: error
            },
        );
    }
}