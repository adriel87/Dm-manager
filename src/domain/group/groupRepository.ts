import { Character } from "../character/character";
import { Group } from "./group";

export interface GroupRepository {
    createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group>
    getGroupById(id: string): Promise<Group | null>
    getAllGroups(): Promise<Group[]>
    updateGroup(id: string, group: Group): Promise<Group | null>
    addMembersToGroup(groupId: string, members: Pick<Character, 'id' | 'name' | 'classType'>[]): Promise<boolean>
    removeMembersFromGroup(groupId: string, memberIds: string[]): Promise<boolean>
    deleteGroup(id: string): Promise<boolean>
}