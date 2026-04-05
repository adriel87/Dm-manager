import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { MapperUtils } from "../../mappers/utils";
import { mapGroupDocumentToGroup } from "../../mappers/group.mapper";
import { ObjectId } from "mongodb";
import { Character } from "@/domain/character/character";


export const groupRepository: GroupRepository = {
    createGroup: async function (group: Omit<Group, 'id'>): Promise<Group> {
        const collection = await getCollection("groups");
        const result = await collection.insertOne(group);
        if(!result.acknowledged){
            throw new Error("Couldn't create a group")
        }
        return {
            ...group,
            id: result.insertedId.toString()
        };
    },
    getGroupById: async function (id: string): Promise<Group | null> {
        if (!id) {
            throw new Error("Group ID is required");
        }
        const collection = await getCollection("groups");
        const group = await collection.findOne({ _id: new ObjectId(id) });
        return group ? mapGroupDocumentToGroup(group) : null;

    },
    getAllGroups: async function (): Promise<Group[]> {
        const collection = await getCollection("groups");
        const groups = await collection.find({}).toArray();
        return MapperUtils.fromDocumentListToEntityList(groups, mapGroupDocumentToGroup);
    },
    updateGroup: async function (id: string, group: Group): Promise<Group | null> {
        if (!id) {
            throw new Error("Group ID is required");
        }
        if (!group || Object.keys(group).length === 0) {
            throw new Error("Group data is required for update");
        }
        const collection = await getCollection("groups");
        const updateResult = await collection.updateOne({ _id: new ObjectId(id) }, { $set: group });
        return updateResult.modifiedCount > 0 ? { ...group, id } : null;
    },
    addMembersToGroup: async function (groupId: string, members: Pick<Character, 'id' | 'name' | 'classType'>[]): Promise<boolean> {
        if (!groupId || !members || members.length === 0) {
            throw new Error("Group ID and members are required");
        }
        const GroupCollection = await getCollection("groups");
        const group = await GroupCollection.findOne({ _id: new ObjectId(groupId) });
        if (!group) { 
            throw new Error("Group not found");
        }
        const updateResult = await GroupCollection.updateOne(
            { _id: new ObjectId(groupId) },
            { $addToSet: { members: { $each: members } } }
        );
        return updateResult.modifiedCount > 0 
    },
    removeCharactersFromGroup: async function (groupId: string, memberIds: string[]): Promise<boolean> {
        if (!groupId || !memberIds || memberIds.length === 0) {
            throw new Error("Group ID and member IDs are required");
        }
        const GroupCollection = await getCollection("groups");
        const groupDocument = await GroupCollection.findOne({ _id: new ObjectId(groupId) });
        if (!groupDocument) {
            throw new Error("Group not found");
        }
        const group = mapGroupDocumentToGroup(groupDocument);
        const filteredMembers = group.members.filter(member => !memberIds.includes(member.id)).map(member => ({
            id: member.id,
            name: member.name,
            classType: member.classType
        }));
        const updateResult = await GroupCollection.updateOne(
            { _id: new ObjectId(groupId) },
            { $set: { members: filteredMembers } }
        );
        return updateResult.modifiedCount > 0;
    },
    deleteGroup: async function (id: string): Promise<boolean> {
        if (!id) {
            throw new Error("Group ID is required");
        }
        const collection = await getCollection("groups");
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        return deleteResult.deletedCount > 0;
    }
}