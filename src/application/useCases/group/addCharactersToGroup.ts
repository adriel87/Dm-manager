import { Character } from "@/domain/character/character";
import { GroupRepository } from "@/domain/group/groupRepository";
import { getGroupById } from "./getGroup";
import { validateMembers } from "@/domain/group/group";
import { updatedGroup } from "./updateGroup";

export const addMenberToGroup = async (groupRepository : GroupRepository,groupId: string, characters:Pick<Character, "id" | "name" | "classType">[])=>{
    validateMembers(characters)
    let group = await getGroupById(groupRepository, groupId)
    if (!group) {
        throw new Error("El id del grupo es invalido")
    }
    group = {
        ...group,
        members: [
            ...group.members,
            ...characters
        ]
    }
    const result = await updatedGroup(groupRepository, groupId, group)
    return Boolean(result)
}