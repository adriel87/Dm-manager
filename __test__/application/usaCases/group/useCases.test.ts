import { createGroup } from "@/application/useCases/group/createGroup";
import { getAllGroups } from "@/application/useCases/group/getAllGroups";
import { getGroupById } from "@/application/useCases/group/getGroup";
import { Group } from "@/domain/group/group";
import { GroupRepository } from "@/domain/group/groupRepository";
import { describe, expect, it, vi } from "vitest";

describe('Testing use case group', () => {

    const mockGroupRepository: GroupRepository = {
        createGroup: vi.fn(),
        getGroupById: vi.fn(),
        getAllGroups: vi.fn(),
        updateGroup: vi.fn(),
        addMembersToGroup: vi.fn(),
        removeMembersFromGroup: vi.fn(),
        deleteGroup: vi.fn(),
    }

    describe('getAllGroups', () => {

        it('Must return a group list', () => {
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
            expect(result).resolves.toEqual(groups);

        })
        it('Si el repo no es válido debe devolver el error "es necesario un repositorio válido"', () => {
            //Arrange
           
            //Act
            //@ts-ignore
            const result = getAllGroups()

            //Assert
            expect(result).rejects.toThrow('es necesario un repositorio válido');

        })
    })

    describe ('getGroupById', () => {
        it('Must return one group passing an id',() =>{
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
            expect(result).resolves.toEqual(group);
        }),

        it('Debe arrojar un error si el id no es válido, No es válido si el id es distinto a un string o no sea cadena vacía',() =>{
            //Arrange           
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(null);
            const id = "";
            const nullId = null;
            //Act
            const result = getGroupById(mockGroupRepository,id);
            //@ts-ignore
            const result2 = getGroupById(mockGroupRepository,nullId);
            //Assert
            expect(result).rejects.toThrow('Invalid ID');
            expect(result2).rejects.toThrow('Invalid ID');
        })
        it('Debe arrojar un error si el id no es válido, No es válido si el id es distinto a un string o no sea cadena vacía',() =>{
            //Arrange           
       
            //Act
            //@ts-ignore
            const result = getGroupById('','2');
            
            //Assert
            expect(result).rejects.toThrow('Invalid Repository');
           
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

        it('should throw an error for invalid group data',() =>{
            //Arrange           
         
            //Act
          
            //@ts-ignore
           
            //Assert
           
        })
    })
})