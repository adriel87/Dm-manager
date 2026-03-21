import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

export const getGroupById = async (repository: GroupRepository, id: string): Promise<Group | null> => {

    if (!id) throw new Error("Invalid ID");
    const group = await repository.getGroupById(id);
    return group;

}