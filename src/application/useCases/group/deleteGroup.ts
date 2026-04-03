import { GroupRepository } from "@/domain/group/groupRepository";

export const deleteGroup = async (groupRepository : GroupRepository, id: string ) : Promise<boolean> => {
     if (!id) throw new Error('Invalid group id');

     const createdGroup = await groupRepository.deleteGroup(id);

     return createdGroup;
}