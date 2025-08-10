import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

export const deleteGroup = async (groupRepository : GroupRepository, id: string ) : Promise<boolean> => {
    //Validate the group object
     if (!groupRepository || !('deleteGroup' in groupRepository))  throw new Error('Invalid Repository');
    
     if (id === null || id === undefined || id === '') throw new Error('Invalid group id');

     const createdGroup = await groupRepository.deleteGroup(id);

     return createdGroup;
}