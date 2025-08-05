import { Group } from "./group";

export interface GroupRepository {
    createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group>
    getGroupById(id: string): Promise<Group | null>
    getAllGroups(): Promise<Group[]>
    updateGroup(id: string, group: Partial<Group>): Promise<Group | null>
    addMembersToGroup(groupId: string, memberIds: string[]): Promise<Group | null>
    removeMembersFromGroup(groupId: string, memberIds: string[]): Promise<Group | null>
    deleteGroup(id: string): Promise<boolean>
}