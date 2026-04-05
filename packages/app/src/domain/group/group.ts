import { Character } from "../character/character";

export interface Group {
  id: string;
  name: string;
  members: Pick<Character, "id" | "name" | "classType">[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const validateGroup = (group: Partial<Group>): boolean => {
  if (!group.name || group.name.trim() === "") {
    throw new Error("Group name is required");
  }
  if (!group.description || group.description.trim() === "") {
    throw new Error("Group description is required");
  }
  if (!Array.isArray(group.members)) {
    throw new Error("Group members must be an array");
  }
  validateMembers(group.members);
  return true;
};

export function validateMembers(
  members: Pick<Character, "id" | "name" | "classType">[],
) {
  members?.forEach((member) => {
    if (!member.id || !member.name || !member.classType) {
      throw new Error("Each member must have id, name, and classType");
    }
  });
}
