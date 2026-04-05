import { Character } from "../character/character";
import { Group } from "./group";

export interface GroupRepository {
  createGroup(group: Omit<Group, "id">): Promise<Group>;
  getGroupById(id: string): Promise<Group | null>;
  getAllGroups(): Promise<Group[]>;
  updateGroup(id: string, group: Group): Promise<Group | null>;
  addMembersToGroup(
    groupId: string,
    members: Pick<Character, "id" | "name" | "classType">[],
  ): Promise<boolean>;
  removeCharactersFromGroup(
    groupId: string,
    chartactersIds: string[],
  ): Promise<boolean>;
  deleteGroup(id: string): Promise<boolean>;
}

export type ValidGroupRepository = GroupRepository;
