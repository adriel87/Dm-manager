import { createCampaign } from "@/application/useCases/campaign";
import { createCharacter } from "@/application/useCases/character/createCharacter";
import { createGroup } from "@/application/useCases/group/createGroup";
import { createMission } from "@/application/useCases/mission";
import { CampaignI } from "@/domain/campaign/campaign";
import { Character, DnDClassEnum } from "@/domain/character/character";
import { Group } from "@/domain/group/group";
import { Mission } from "@/domain/mission/mission";
import { campaignRepository } from "@/infrastructure/adapters/repositories/mongo/campaign.repository";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { groupRepository } from "@/infrastructure/adapters/repositories/mongo/group.repository";
import { missionRepository } from "@/infrastructure/adapters/repositories/mongo/mission.repository";
import { NextResponse } from "next/server";

//CHARACTER
const characterData: Omit<Character, 'id'> = {
    name: 'Carmelo',
    age: "adult",
    classType: DnDClassEnum.Druid,
    level: 10,
    hitPoints: 50,
    createdAt: new Date('2025-09-20'),
    updatedAt: undefined,
    description: 'A fierce carmelo warrior',
    location: 'moya',
    isNPC: false
}
const campaign :Omit<CampaignI, "id"> = {
    description: 'campaña test',
    name: 'la tesita',
    characters: [
        {
            classType: 'Cleric',
            id:'id1',
            level: 1,
            name:'Uzzuk'
        },
    ],
    group: null,
    missions: [{
        description: 'la mision seedeada',
        id:'missionid',
        missionEvents: [{
            difficult: 'high',
            name: 'resolver puzzle',
        }],
        missionGuide: 'la guia de la misiones',
        missionPriority: 'high',
        name: 'el puzzle del mal',
        relatedCharacters: [{
            id: 'id1',
            name: 'otro char'
        }],
        rewards: 'gloria',
        status: 'Activa'
    }],
    sessions:[
        {
            date: new Date(),
            id: 'id3',
            notes: 'pues pasaron cosas en esta sesion',
            sessionNumber: 1,
            title: 'comienza la aventura'
        }
    ],
    status:"Activa",
    inventory: { items: [], capacity: 100, money: 0 },

}
const misision : Omit<Mission, "id"> = {
    description: 'la misionnita',
    endDate: new Date('2025-09-20'),
    name: 'la mision de test',
    startDate: new Date('2025-09-20'),
    status: "Activa",
    missionEvents: [{
        name: 'llslsls',
        difficult: 'super hipel'
    }],
    missionGuide: 'la guia',
    missionPriority: 'alta',
    relatedCharacters: null,
    rewards: ''
}

const group: Omit<Group, "id" | "createdAt" | "updatedAt"> ={
    description: 'el grupo de la siembra',
    name: 'siesmbrones',
    members:[]
}
export async function POST() {
    try {
        await createCharacter(characterRepository,characterData)
        await createCampaign(campaignRepository,campaign)
        await createMission(missionRepository,misision)
        await createGroup(groupRepository, group)
        // await characterRepository.createCharacter(characterData)
        // await campaignRepository.
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