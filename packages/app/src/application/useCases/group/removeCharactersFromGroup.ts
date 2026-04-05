import { GroupRepository } from "@/domain/group/groupRepository";

export const removeCharactersFromGroup = async (groupRepository: GroupRepository, groupId: string, charactersIds: string[]) : Promise<boolean> =>{

    if (!groupId) throw new Error('Invalid group id');

    if (charactersIds === null || charactersIds.length === 0) throw new Error('Empty data cannot be deleted');

    const deleteCharactersFromGroup = groupRepository.removeCharactersFromGroup(groupId,charactersIds);
    
    return deleteCharactersFromGroup;
}