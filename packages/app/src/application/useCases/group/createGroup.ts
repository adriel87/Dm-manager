import { Group, validateGroup } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

export const createGroup = async (groupRepository : GroupRepository, group: Omit<Group, "id" | "createdAt" | "updatedAt">) : Promise<Group> => {
     validateGroup(group)
    
     const groupData : Omit<Group, "id"> = {
        ...group,
        createdAt: new Date(),
        updatedAt: undefined,
     }

     const createdGroup = await groupRepository.createGroup(groupData);

     return createdGroup;
}