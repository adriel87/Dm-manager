import { Character } from "../character/character";


export interface Group {
    id: string;
    name: string;
    members: Pick<Character, "id" | "name" | "classType">[];
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}