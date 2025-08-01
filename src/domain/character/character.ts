

export interface Character {
    id: string;
    name: string;
    age: AgeType;
    class: keyof typeof DnDClassEnum;
    level: number;
    hitPoints: number;
    createdAt: Date;
    updatedAt: Date | undefined;
    description?: string;
    location?: string;
    isNPC?: boolean; // Non-Player Character
     // Add more properties as needed
}

export interface PersonanlDetails {
    name: string;
    age: AgeType;
    location?: string;
}

export class CharacterEntity implements Character {
    id: string; 
    name: string;
    age: AgeType;
    class: keyof typeof DnDClassEnum;
    level: number;
    hitPoints: number;
    createdAt: Date;
    updatedAt: Date | undefined;
    description?: string;
    location?: string;
    isNPC?: boolean;
    constructor(
        id: string,
        name: string,
        age: AgeType,
        classType: keyof typeof DnDClassEnum,
        level: number,
        hitPoints: number,
        createdAt: Date,
        updatedAt?: Date,
        description?: string,
        location?: string,
        isNPC?: boolean
    ) {
        if (!id || !name || !age || !classType || level < 1 || hitPoints < 0) {
            throw new Error("Invalid character data");
        }
        this.id = id;
        this.name = name;
        this.age = age;
        this.class = classType
        this.level = level;
        this.hitPoints = hitPoints;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.description = description
        this.location = location;
        this.isNPC = isNPC;
    }
    // Add methods for business logic if needed
    updateCharacter(partial: Partial<Character>) {
        if (partial.name) this.name = partial.name;
        if (partial.age) this.age = partial.age;
        if (partial.class) this.class = partial.class;
        if (partial.level) this.level = partial.level;
        if (partial.hitPoints) this.hitPoints = partial.hitPoints;
        if (partial.description) this.description = partial.description;
        if (partial.location) this.location = partial.location;
        if (partial.isNPC !== undefined) this.isNPC = partial.isNPC;
        this.updatedAt = new Date();
    }
}

export const isValidCharacter = (character: Partial<Character>): boolean => {
    if (!character.name || !character.age || !character.class || character.level === undefined || character.level < 1 || character.hitPoints === undefined || character.hitPoints < 0) {
        return false;
    }
    return true;
}

export type AgeType = 'child' | 'teenager' | 'adult' | 'elderly';
export enum DnDClassEnum {
    Barbarian = 'Barbarian',
    Bard = 'Bard',
    Cleric = 'Cleric',
    Druid = 'Druid',
    Fighter = 'Fighter',
    Monk = 'Monk',
    Paladin = 'Paladin',
    Ranger = 'Ranger',
    Rogue = 'Rogue',
    Sorcerer = 'Sorcerer',
    Warlock = 'Warlock',
    Wizard = 'Wizard',
    Artificer = 'Artificer',
    BloodHunter = 'Blood Hunter',
    Normal = 'Normal', // For non-DnD characters
    Other = 'Other', // For characters not fitting into the above categories
}