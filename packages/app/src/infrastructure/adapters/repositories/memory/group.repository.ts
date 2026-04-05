import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";

let store: Group[] = [];
let nextId = 1;

export const groupMemoryRepository: GroupRepository = {
  getAllGroups: async () => [...store],

  getGroupById: async (id) => store.find((g) => g.id === id) ?? null,

  createGroup: async (group) => {
    const created: Group = { ...group, id: String(nextId++) };
    store.push(created);
    return created;
  },

  updateGroup: async (id, group) => {
    const index = store.findIndex((g) => g.id === id);
    if (index === -1) return null;
    store[index] = group;
    return group;
  },

  addMembersToGroup: async (groupId, members) => {
    const group = store.find((g) => g.id === groupId);
    if (!group) return false;
    group.members = [...group.members, ...members];
    return true;
  },

  removeCharactersFromGroup: async (groupId, characterIds) => {
    const group = store.find((g) => g.id === groupId);
    if (!group) return false;
    group.members = group.members.filter((m) => !characterIds.includes(m.id));
    return true;
  },

  deleteGroup: async (id) => {
    const index = store.findIndex((g) => g.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  },
};

export const resetGroupStore = () => {
  store = [];
  nextId = 1;
};
