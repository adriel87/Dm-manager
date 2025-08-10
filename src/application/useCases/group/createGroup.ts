import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

export const createGroup = async (groupRepository : GroupRepository, group: Omit<Group, "id" | "createdAt" | "updatedAt">) : Promise<Group> => {
    //Validate the group object
     if (!groupRepository || !('createGroup' in groupRepository))  throw new Error('Invalid Repository');

     if (!group || !group.name?.trim() || !group.description?.trim()) throw new Error('Invalid group data');

     const groupData : Omit<Group, "id"> = {
        ...group,
        createdAt: new Date(),
        updatedAt: undefined,
     }

     const createdGroup = await groupRepository.createGroup(groupData);

     return createdGroup;
}