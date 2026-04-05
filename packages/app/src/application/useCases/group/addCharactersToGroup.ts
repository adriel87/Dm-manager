import { Character } from "@/domain/character/character";
import { GroupRepository } from "@/domain/group/groupRepository";
import { validateMembers } from "@/domain/group/group";

export const addMemberToGroup = async (groupRepository : GroupRepository, groupId: string, characters: Pick<Character, "id" | "name" | "classType">[]) => {
    if (!groupId) throw new Error("Invalid ID")
    validateMembers(characters)
    const group = await groupRepository.getGroupById(groupId)
    if (!group) {
        throw new Error("El id del grupo es invalido")
    }
    const updated = { ...group, members: [...group.members, ...characters] }
    const result = await groupRepository.updateGroup(groupId, updated)
    return Boolean(result)
}