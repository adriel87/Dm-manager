import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";
import { getCollection } from "@/infrastructure/config/mongodb";
import { MapperUtils } from "../../mappers/utils";
import { mapGroupDocumentToGroup } from "../../mappers/group.mapper";
import { Document, WithId } from "mongodb";


export const groupRepository: GroupRepository = {
    createGroup: function (group: Omit<Group, "id" | "createdAt" | "updatedAt">): Promise<Group> {
        throw new Error("Function not implemented.");
    },
    getGroupById: function (id: string): Promise<Group | null> {
        throw new Error("Function not implemented.");
    },
    getAllGroups: async function (): Promise<Group[]> {
        const collection = await getCollection("groups");
        const groups = await collection.find({}).toArray();
        return MapperUtils.fromDocumentListToEntityList(groups  as WithId<Document>[], mapGroupDocumentToGroup);
    },
    updateGroup: function (id: string, group: Partial<Group>): Promise<Group | null> {
        throw new Error("Function not implemented.");
    },
    addMembersToGroup: function (groupId: string, memberIds: string[]): Promise<Group | null> {
        throw new Error("Function not implemented.");
    },
    removeMembersFromGroup: function (groupId: string, memberIds: string[]): Promise<Group | null> {    
        throw new Error("Function not implemented.");
    },
    deleteGroup: function (id: string): Promise<boolean> {
        throw new Error("Function not implemented.");
    }
}