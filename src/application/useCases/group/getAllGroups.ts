import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

export const getAllGroups = async (groupRepository: GroupRepository): Promise<Group[]> => {
    // if (groupRepository === null || groupRepository === undefined) throw new Error("es necesario un repositorio válido")
    if (!groupRepository) throw new Error("es necesario un repositorio válido")
    const groups = await groupRepository.getAllGroups();
    return groups;
}
