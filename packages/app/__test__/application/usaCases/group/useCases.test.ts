import { addMemberToGroup } from "@/application/useCases/group/addCharactersToGroup";
import { createGroup } from "@/application/useCases/group/createGroup";
import { deleteGroup } from "@/application/useCases/group/deleteGroup";
import { getAllGroups } from "@/application/useCases/group/getAllGroups";
import { getGroupById } from "@/application/useCases/group/getGroup";
import { removeCharactersFromGroup } from "@/application/useCases/group/removeCharactersFromGroup";
import { updateGroup } from "@/application/useCases/group/updateGroup";
import { Character, DnDClassEnum } from "@/domain/character/character";
import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe('Testing use case group', () => {

    const mockGroupRepository: GroupRepository = {
        createGroup: vi.fn(),
        getGroupById: vi.fn(),
        getAllGroups: vi.fn(),
        updateGroup: vi.fn(),
        addMembersToGroup: vi.fn(),
        removeCharactersFromGroup: vi.fn(),
        deleteGroup: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllGroups', () => {

        it('Must return a group list', async () => {
            //Arrange
            const groups: Group[] = [{
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            }]
            vi.mocked(mockGroupRepository.getAllGroups).mockResolvedValue(groups)
            //Act
            const result = getAllGroups(mockGroupRepository)

            //Assert
            await expect(result).resolves.toEqual(groups);

        })
        it('Si el repo no es válido debe devolver el error "es necesario un repositorio válido"', async () => {
            //Arrange

            //Act
            //@ts-ignore
            const result = getAllGroups()

            //Assert
            await expect(result).rejects.toThrow('es necesario un repositorio válido');

        })
    })

    describe ('getGroupById', () => {
        it('Must return one group passing an id', async () =>{
            //Arrange
             const group: Group = {
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            };
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(group);

            //Act
            const result = getGroupById(mockGroupRepository,'1')

            //Assert
            await expect(result).resolves.toEqual(group);
        }),

        it('Debe arrojar un error si el id no es válido, No es válido si el id es distinto a un string o no sea cadena vacía', async () =>{
            //Arrange
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(null);
            const id = "";
            const nullId = null;
            //Act
            const result = getGroupById(mockGroupRepository,id);
            //@ts-ignore
            const result2 = getGroupById(mockGroupRepository,nullId);
            //Assert
            await expect(result).rejects.toThrow('Invalid ID');
            await expect(result2).rejects.toThrow('Invalid ID');
        })
    })

    describe ('createGroup', () => {
        const group: Group = {
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                createdAt: new Date(),
                updatedAt: undefined,
                members: [],
            }
        it('Should create a group successfully', async() =>{
            //Arrange
            vi.mocked(mockGroupRepository.createGroup).mockResolvedValue(group);

            //Act
            const result = await createGroup(mockGroupRepository,group)

            //Assert
            expect(result?.id).not.toBeNull();
            expect(result?.name).toBe(group.name);
            expect(result?.description).toBe(group.description);
            expect(result?.createdAt).toBeInstanceOf(Date);
            expect(result?.updatedAt).toBeUndefined();
            expect(mockGroupRepository.createGroup).toHaveBeenCalledOnce();
        }),

        it('should throw an error for invalid group data, Group name is required', async() =>{
            //Arrange
            const invalidGroup = { ...group, name: "" };
            //Act
            const result = createGroup(mockGroupRepository, invalidGroup);

            //Assert
            await expect(result).rejects.toThrow("Group name is required");
            expect(mockGroupRepository.createGroup).not.toHaveBeenCalled();
        })
    })

    describe ('deleteGroupById', () => {
        it('Should delete a group successfully', async() =>{
            //Arrange
            const validId : string = '1'
            vi.mocked(mockGroupRepository.deleteGroup).mockResolvedValue(true);

            //Act
            const result = await deleteGroup(mockGroupRepository,validId)

            //Assert
            expect(result).toBe(true);
            expect(mockGroupRepository.deleteGroup).toHaveBeenCalledWith(validId);
        }),

        it('should throw an error if id is not valid, when is empty null or undefined', async () =>{
            //Arrange
            const invalidEmptyId = ''
            const invalidNullId = null
            const invalidUndefinedId = undefined
            //Act
            const resultinvalidEmptyId = deleteGroup(mockGroupRepository,invalidEmptyId);
            //@ts-ignore
            const resultinvalidNullId = deleteGroup(mockGroupRepository,invalidNullId);
             //@ts-ignore
            const resultinvalidUndefinedId = deleteGroup(mockGroupRepository,invalidUndefinedId);

            //Assert
            await expect(resultinvalidEmptyId).rejects.toThrow("Invalid group id")
            await expect(resultinvalidNullId).rejects.toThrow("Invalid group id")
            await expect(resultinvalidUndefinedId).rejects.toThrow("Invalid group id")
        })
    })

    describe ('updateGroupById', () => {
        const validGroup: Group = {
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            }
        it('Should update a group successfully when is a valid group', async() =>{

            //act
            const groupData = {...validGroup, name: "Updated Group"}
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(validGroup);
            vi.mocked(mockGroupRepository.updateGroup).mockResolvedValue(groupData);

            //Act
            const result = await updateGroup(mockGroupRepository,validGroup.id, groupData)

            //Assert
            expect(result?.name).toBe("Updated Group");
            expect(mockGroupRepository.updateGroup).toHaveBeenCalledOnce();
        }),

        it("debe arrojar una error cuando el nombre del grupo es invalido, el error debe ser 'Nombre del grupo invalido minimo 3 charectes'", async () => {
            // arrange
            const groupWithNameWithLessCharacters = {
                ...validGroup,
                name: 'do'
            }
            const groupWithNameNull = {
                ...validGroup,
                name: null
            }
            const groupWithNameUndefined = {
                ...validGroup,
                name: undefined
            }
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(groupWithNameWithLessCharacters);
            //act
            const result = updateGroup(mockGroupRepository,'22', groupWithNameWithLessCharacters)
            // @ts-ignore
            const resultNull = updateGroup(mockGroupRepository,'22', groupWithNameNull)
            const resultUndefined = updateGroup(mockGroupRepository,'22', groupWithNameUndefined)

            // assert
            await expect(result).rejects.toThrow("Nombre del grupo invalido minimo 3 charectes")
            await expect(resultNull).rejects.toThrow("Nombre del grupo invalido minimo 3 charectes")
            await expect(resultUndefined).rejects.toThrow("Nombre del grupo invalido minimo 3 charectes")
        })

       
    })

    describe ('add menbers to group', ()=>{
        it('Con una lista de miembros validos se deben incluir al grupo', ()=>{
            //arrange
            const characters : Pick<Character, "id" | "name" | "classType">[] = [{
                id: '1',
                classType: DnDClassEnum.Barbarian,
                name: 'pepito'
            }]
            const groupId = '1'
            vi.mocked(mockGroupRepository.addMembersToGroup).mockResolvedValue(true)
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue({
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            })
            vi.mocked(mockGroupRepository.updateGroup).mockResolvedValue({
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            })
            //act
            const result = addMemberToGroup(mockGroupRepository, groupId, characters)
            //assert
            expect(result).toBeTruthy()

        })
        it('Con una lista de miembros invalidos debej arrojar algun error', async ()=>{
            //arrange
            const characters : Pick<Character, "id" | "name" | "classType">[] = [{
                id: '1',
                classType: DnDClassEnum.Barbarian,
                name: ''
            }]
            const groupId = '1'
            vi.mocked(mockGroupRepository.addMembersToGroup).mockResolvedValue(true)
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue({
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            })
            vi.mocked(mockGroupRepository.updateGroup).mockResolvedValue({
                id: '1',
                name: 'pepe',
                description: 'fabuloso',
                members: [],
            })
            //act
            const result = addMemberToGroup(mockGroupRepository, groupId, characters)
            //assert
            await expect(result).rejects.toThrow('Each member must have id, name, and classType')

        })
        it('Con un id invalido debe arrojar un error, Invalid Id', async ()=>{
        //arrange
        const characters : Pick<Character, "id" | "name" | "classType">[] = [{
            id: '1',
            classType: DnDClassEnum.Barbarian,
            name: 'chicho'
        }]
        const groupId = null
        vi.mocked(mockGroupRepository.addMembersToGroup).mockResolvedValue(true)
        vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue({
            id: '1',
            name: 'pepe',
            description: 'fabuloso',
            members: [],
        })
        vi.mocked(mockGroupRepository.updateGroup).mockResolvedValue({
            id: '1',
            name: 'pepe',
            description: 'fabuloso',
            members: [],
        })
        //act
        // @ts-ignore
        const result = addMemberToGroup(mockGroupRepository, groupId, characters)
        //assert
        await expect(result).rejects.toThrow('Invalid ID')

    })

    })

    describe('remove characters from group', ()=> {
        it("Con una lista de ids de miembros valido y un id de grupo validos, se debe poder borrar el miembro del grupo", async()=>{
            // arrange
            const membersId = ['1']
            const groupId = '1'
            vi.mocked(mockGroupRepository.removeCharactersFromGroup).mockResolvedValue(true)
            //act
            const result = await removeCharactersFromGroup(mockGroupRepository, groupId, membersId)
            //assert
            expect(result).toBeTruthy()
        })

        it("Con una lista de ids de miembros vacía y un id de grupo valido, no se debe puede borrar una lista vacía", async ()=>{
            // arrange
            const membersId = [] as any
            const groupId = '1'
            vi.mocked(mockGroupRepository.removeCharactersFromGroup).mockResolvedValue(true)
            //act
            const result = removeCharactersFromGroup(mockGroupRepository, groupId, membersId)
            //assert
            await expect(result).rejects.toThrow("Empty data cannot be deleted")
        })
    })
})