import { Group, validateGroup } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";


export const updatedGroup = async (groupRepository : GroupRepository, id: string, partialGroup: Partial<Group>): Promise<Group | null> => {

    if (!groupRepository || !('updateGroup' in groupRepository))  throw new Error('Invalid Repository');

    if(!id || !partialGroup) throw new Error ("Invalid Group ID or data");
    if (partialGroup.name === undefined || partialGroup.name === null || partialGroup.name?.length < 3) throw new Error ("Nombre del grupo invalido minimo 3 charectes");

    const existingGroup = await groupRepository.getGroupById(id);

    if (!existingGroup) throw new Error ("Group not found");

    const updateGroup : Group = {
        ...existingGroup,
        ...partialGroup,
        updatedAt: new Date(),
    };

    const isValid = validateGroup(updateGroup);

    if(!isValid) throw new Error ("Invalid character data");

    const result = await groupRepository.updateGroup(id,updateGroup);

     if (!result) throw new Error("Character update failed");

    return updateGroup;

}