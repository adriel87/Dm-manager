import { addMission, addSession, assignCharacter, assignGroup, createCampaign, deleteCampaign, getAllCampaigns, getCampaignById, getMissions, removeCharacter, removeGroup, removeMission, removeSession, updateCampaign, updateMission, updateSession, addNote, removeNote, getNotes } from "@/application/useCases/campaign";
import { CampaignI, CharacterRef, EmbeddedMission, EmbeddedNote, EmbeddedSession, GroupSnapshot } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { CharacterRepository } from "@/domain/character/characterRepository";
import { GroupRepository } from "@/domain/group/groupRepository";
import { beforeEach,  describe,  expect, it, vi } from "vitest";


describe("Campaign use cases", () => {
    // Mock campaign repository with ALL 15 methods
    const mockCampaignRepository: CampaignRepository = {
        // Root CRUD (5 methods)
        getAllCampaigns: vi.fn(),
        getCampaignById: vi.fn(),
        createCampaign: vi.fn(),
        updateCampaign: vi.fn(),
        deleteCampaign: vi.fn(),
        
        // Mission operations (3 methods)
        addMission: vi.fn(),
        updateMission: vi.fn(),
        removeMission: vi.fn(),
        
        // Session operations (3 methods)
        addSession: vi.fn(),
        updateSession: vi.fn(),
        removeSession: vi.fn(),
        
        // Character operations (2 methods)
        addCharacter: vi.fn(),
        removeCharacter: vi.fn(),
        
        // Group operations (2 methods)
        assignGroup: vi.fn(),
        removeGroup: vi.fn(),

        // Note operations (2 methods)
        addNote: vi.fn(),
        removeNote: vi.fn(),
    };

    const mockCharacterRepository: CharacterRepository = {
        getAllCharacters: vi.fn(),
        getCharacterById: vi.fn(),
        createCharacter: vi.fn(),
        updateCharacter: vi.fn(),
        deleteCharacter: vi.fn(),
    };

    const mockGroupRepository: GroupRepository = {
        getAllGroups: vi.fn(),
        getGroupById: vi.fn(),
        createGroup: vi.fn(),
        updateGroup: vi.fn(),
        deleteGroup: vi.fn(),
        addMembersToGroup: vi.fn(),
        removeCharactersFromGroup: vi.fn(),
    };

    const validMission: EmbeddedMission = {
        id: 'mission-1',
        name: 'Rescue the Princess',
        description: 'Save the princess from the dragon',
        missionGuide: 'Guide to rescue mission',
        missionPriority: 'high',
        status: 'Activa',
        missionEvents: null,
        rewards: null,
        relatedCharacters: null,
    };

    const validSession: EmbeddedSession = {
        id: 'session-1',
        title: 'First Session',
        notes: 'Session notes here',
        sessionNumber: 1,
        date: new Date('2026-03-01'),
    };

    const validCharacterRef: CharacterRef = {
        id: 'char-1',
        name: 'Gandalf',
        classType: 'Wizard',
        level: 10,
    };

    const validGroupSnapshot: GroupSnapshot = {
        id: 'group-1',
        name: 'The Fellowship',
        description: 'A fellowship of adventurers',
        members: [
            { id: 'char-1', name: 'Gandalf', classType: 'Wizard' }
        ],
        snapshotAt: new Date(),
    };

    const validCampaign: CampaignI = {
        id: "1",
        name: "campaign name",
        description: 'campaign description',
        status: 'Activa',
        missions: [],
        sessions: [],
        notes: [],
        characters: [],
        group: null,
    };

    const validNote: EmbeddedNote = {
        id: 'note-1',
        comment: 'Remember the NPC name is Thornwick',
        color: 'yellow',
        createdAt: new Date('2026-03-01'),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });


    // ========================================
    // Root CRUD Operations
    // ========================================

    describe("createCampaign", () => {
        it("should create a campaign successfully with empty collections", async () => {
            const { id, ...campaignData } = validCampaign;
            const createdCampaign = { ...validCampaign, missions: [], sessions: [], characters: [], group: null };
            vi.mocked(mockCampaignRepository.createCampaign).mockResolvedValue(createdCampaign);
            
            const result = await createCampaign(mockCampaignRepository, campaignData);
            
            expect(result.id).toBe(validCampaign.id);
            expect(result.missions).toEqual([]);
            expect(result.sessions).toEqual([]);
            expect(result.characters).toEqual([]);
            expect(result.group).toBeNull();
            expect(mockCampaignRepository.createCampaign).toHaveBeenCalledOnce();
        });

        it("should throw 'Failed to create campaign' when name is invalid", async () => {
            const { id, ...campaignData } = validCampaign;
            const invalidData = { ...campaignData, name: "ab" };
            
            await expect(createCampaign(mockCampaignRepository, invalidData)).rejects.toThrow("Failed to create campaign");
            expect(mockCampaignRepository.createCampaign).not.toHaveBeenCalled();
        });

        it("should throw 'Failed to create campaign' when description is missing", async () => {
            const { id, ...campaignData } = validCampaign;
            const invalidData = { ...campaignData, description: "" };
            
            await expect(createCampaign(mockCampaignRepository, invalidData)).rejects.toThrow("Failed to create campaign");
            expect(mockCampaignRepository.createCampaign).not.toHaveBeenCalled();
        });

        it("should throw 'Failed to create campaign' when repository throws", async () => {
            const { id, ...campaignData } = validCampaign;
            vi.mocked(mockCampaignRepository.createCampaign).mockRejectedValue(new Error("DB error"));
            
            await expect(createCampaign(mockCampaignRepository, campaignData)).rejects.toThrow("Failed to create campaign");
        });
    });

    describe("getAllCampaigns", () => {
        it("should return all campaigns", async () => {
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockResolvedValue([validCampaign]);
            
            const result = await getAllCampaigns(mockCampaignRepository);
            
            expect(result).toEqual([validCampaign]);
            expect(mockCampaignRepository.getAllCampaigns).toHaveBeenCalledOnce();
        });

        it("should return an empty array when there are no campaigns", async () => {
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockResolvedValue([]);
            
            const result = await getAllCampaigns(mockCampaignRepository);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should throw 'Failed to fetch campaigns' when repository throws", async () => {
            vi.mocked(mockCampaignRepository.getAllCampaigns).mockRejectedValue(new Error("DB connection error"));
            
            await expect(getAllCampaigns(mockCampaignRepository)).rejects.toThrow("Failed to fetch campaigns");
        });
    });

    describe("getCampaignById", () => {
        it("should return a campaign by ID", async () => {
            const id = '1';
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            
            const result = await getCampaignById(mockCampaignRepository, id);
            
            expect(result?.id).toBe(validCampaign.id);
            expect(result?.name).toBe(validCampaign.name);
            expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledWith(validCampaign.id);
        });

        it("should return null when campaign not exist", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            const id = "non-existent-id";
            
            const result = await getCampaignById(mockCampaignRepository, id);
            
            expect(result).toBe(null);
        });

        it("should throw an error when the id is invalid", async () => {
            const id = null;
            
            await expect(getCampaignById(mockCampaignRepository, id as unknown as string)).rejects.toThrow("Invalid id");
        });
    });

    describe("updateCampaign", () => {
        it("should update a campaign successfully", async () => {
            vi.mocked(mockCampaignRepository.updateCampaign).mockResolvedValue({ ...validCampaign, name: "Updated Name" });
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            
            const result = await updateCampaign(mockCampaignRepository, { ...validCampaign, name: "Updated Name" });
            
            expect(mockCampaignRepository.updateCampaign).toHaveBeenCalledOnce();
            expect(mockCampaignRepository.getCampaignById).toHaveBeenCalledOnce();
        });

        it("should throw an error for invalid campaign data", async () => {
            await expect(updateCampaign(mockCampaignRepository, {} as CampaignI)).rejects.toThrow("Invalid campaign data or ID");
        });

        it("should throw 'Campaign not found' when campaign does not exist", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);
            
            await expect(updateCampaign(mockCampaignRepository, validCampaign)).rejects.toThrow("Campaign not found");
            expect(mockCampaignRepository.updateCampaign).not.toHaveBeenCalled();
        });

        it("should throw 'Failed to update campaign' when repository returns null", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.updateCampaign).mockResolvedValue(null);
            
            await expect(updateCampaign(mockCampaignRepository, validCampaign)).rejects.toThrow("Failed to update campaign");
        });
    });

    describe("deleteCampaign", () => {
        it("should delete a campaign successfully", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.deleteCampaign).mockResolvedValue(true);
            
            const result = await deleteCampaign(mockCampaignRepository, validCampaign.id);
            
            expect(result).toBe(true);
            expect(mockCampaignRepository.deleteCampaign).toHaveBeenCalledWith(validCampaign.id);
        });

        it("should throw an error if campaign does not exist", async () => {
            vi.mocked(mockCampaignRepository.deleteCampaign).mockResolvedValue(false);
            
            await expect(deleteCampaign(mockCampaignRepository, null as any)).rejects.toThrow("Failed to delete campaign");
        });
    });


    // ========================================
    // Mission Operations
    // ========================================

    describe("addMission", () => {
        it("should add a mission with generated UUID", async () => {
            const campaignWithMission = { ...validCampaign, missions: [validMission] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.addMission).mockResolvedValue(campaignWithMission);
            
            const { id, ...missionData } = validMission;
            const result = await addMission(mockCampaignRepository, validCampaign.id, missionData);
            
            expect(result.id).toBeDefined();
            expect(result.name).toBe(validMission.name);
            expect(mockCampaignRepository.addMission).toHaveBeenCalledWith(
                validCampaign.id,
                expect.objectContaining({ ...missionData, id: expect.any(String) })
            );
        });

        it("should validate mission before adding", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            const { id, ...invalidMission } = validMission;
            const invalidData = { ...invalidMission, name: "ab" }; // too short
            
            await expect(addMission(mockCampaignRepository, validCampaign.id, invalidData)).rejects.toThrow();
            expect(mockCampaignRepository.addMission).not.toHaveBeenCalled();
        });

        it("should check unique mission name", async () => {
            const campaignWithExisting = { ...validCampaign, missions: [validMission] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithExisting);
            
            const { id, ...duplicateMission } = validMission;
            await expect(addMission(mockCampaignRepository, validCampaign.id, duplicateMission)).rejects.toThrow(
                `Ya existe una misión con el nombre "${validMission.name}" en esta campaña`
            );
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);
            
            const { id, ...missionData } = validMission;
            await expect(addMission(mockCampaignRepository, validCampaign.id, missionData)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });

    describe("updateMission", () => {
        it("should update a mission successfully", async () => {
            const campaignWithMission = { ...validCampaign, missions: [validMission] };
            const updatedMission = { ...validMission, name: "Updated Mission Name" };
            const campaignWithUpdated = { ...validCampaign, missions: [updatedMission] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMission);
            vi.mocked(mockCampaignRepository.updateMission).mockResolvedValue(campaignWithUpdated);
            
            const result = await updateMission(mockCampaignRepository, validCampaign.id, updatedMission);
            
            expect(result.name).toBe("Updated Mission Name");
            expect(mockCampaignRepository.updateMission).toHaveBeenCalledWith(validCampaign.id, updatedMission);
        });

        it("should validate mission before updating", async () => {
            const campaignWithMission = { ...validCampaign, missions: [validMission] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMission);
            
            const invalidUpdate = { ...validMission, name: "ab" }; // too short
            await expect(updateMission(mockCampaignRepository, validCampaign.id, invalidUpdate)).rejects.toThrow();
        });

        it("should check unique mission name excluding current mission", async () => {
            const mission2 = { ...validMission, id: 'mission-2', name: 'Another Mission' };
            const campaignWithMissions = { ...validCampaign, missions: [validMission, mission2] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMissions);
            
            // Try to rename mission-2 to have same name as mission-1
            const duplicateUpdate = { ...mission2, name: validMission.name };
            await expect(updateMission(mockCampaignRepository, validCampaign.id, duplicateUpdate)).rejects.toThrow(
                `Ya existe una misión con el nombre "${validMission.name}" en esta campaña`
            );
        });
    });

    describe("removeMission", () => {
        it("should remove a mission successfully", async () => {
            const campaignWithMission = { ...validCampaign, missions: [validMission] };
            const campaignWithoutMission = { ...validCampaign, missions: [] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMission);
            vi.mocked(mockCampaignRepository.removeMission).mockResolvedValue(campaignWithoutMission);
            
            await removeMission(mockCampaignRepository, validCampaign.id, validMission.id);
            
            expect(mockCampaignRepository.removeMission).toHaveBeenCalledWith(validCampaign.id, validMission.id);
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);
            
            await expect(removeMission(mockCampaignRepository, validCampaign.id, validMission.id)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });

    describe("getMissions", () => {
        it("should return all missions from a campaign", async () => {
            const campaignWithMissions = { ...validCampaign, missions: [validMission] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithMissions);
            
            const result = await getMissions(mockCampaignRepository, validCampaign.id);
            
            expect(result).toEqual([validMission]);
        });

        it("should return empty array when campaign has no missions", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            
            const result = await getMissions(mockCampaignRepository, validCampaign.id);
            
            expect(result).toEqual([]);
        });
    });


    // ========================================
    // Session Operations
    // ========================================

    describe("addSession", () => {
        it("should add a session with auto-incremented sessionNumber", async () => {
            const session1 = { ...validSession, id: 'session-1', sessionNumber: 1 };
            const campaignWithSession = { ...validCampaign, sessions: [session1] };
            const campaignWithTwoSessions = { ...validCampaign, sessions: [session1, { ...validSession, id: 'session-2', sessionNumber: 2 }] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithSession);
            vi.mocked(mockCampaignRepository.addSession).mockResolvedValue(campaignWithTwoSessions);
            
            const { id, sessionNumber, ...sessionData } = validSession;
            const result = await addSession(mockCampaignRepository, validCampaign.id, sessionData);
            
            expect(result.sessionNumber).toBe(2); // auto-increment from 1 to 2
            expect(result.id).toBeDefined();
        });

        it("should generate UUID for session", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.addSession).mockResolvedValue({ ...validCampaign, sessions: [validSession] });
            
            const { id, sessionNumber, ...sessionData } = validSession;
            const result = await addSession(mockCampaignRepository, validCampaign.id, sessionData);
            
            expect(result.id).toBeDefined();
            expect(mockCampaignRepository.addSession).toHaveBeenCalledWith(
                validCampaign.id,
                expect.objectContaining({ ...sessionData, id: expect.any(String), sessionNumber: 1 })
            );
        });

        it("should update lastSessionAt when session is most recent", async () => {
            const oldSession = { ...validSession, id: 'old-session', date: new Date('2026-01-01') };
            const campaignWithOldSession = { ...validCampaign, sessions: [oldSession], lastSessionAt: new Date('2026-01-01') };
            const newSessionDate = new Date('2026-03-15');
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithOldSession);
            vi.mocked(mockCampaignRepository.addSession).mockResolvedValue({
                ...validCampaign,
                sessions: [oldSession, { ...validSession, date: newSessionDate }]
            });
            vi.mocked(mockCampaignRepository.updateCampaign).mockResolvedValue(validCampaign);
            
            const { id, sessionNumber, ...sessionData } = validSession;
            await addSession(mockCampaignRepository, validCampaign.id, { ...sessionData, date: newSessionDate });
            
            expect(mockCampaignRepository.updateCampaign).toHaveBeenCalled();
        });
    });

    describe("updateSession", () => {
        it("should update a session successfully", async () => {
            const campaignWithSession = { ...validCampaign, sessions: [validSession] };
            const updatedSession = { ...validSession, title: "Updated Session Title" };
            const campaignWithUpdated = { ...validCampaign, sessions: [updatedSession] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithSession);
            vi.mocked(mockCampaignRepository.updateSession).mockResolvedValue(campaignWithUpdated);
            
            const result = await updateSession(mockCampaignRepository, validCampaign.id, updatedSession);
            
            expect(result.title).toBe("Updated Session Title");
            expect(mockCampaignRepository.updateSession).toHaveBeenCalledWith(validCampaign.id, updatedSession);
        });

        it("should validate session before updating", async () => {
            const campaignWithSession = { ...validCampaign, sessions: [validSession] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithSession);
            
            const invalidUpdate = { ...validSession, title: "ab" }; // too short
            await expect(updateSession(mockCampaignRepository, validCampaign.id, invalidUpdate)).rejects.toThrow();
        });

        it("should throw when trying to change sessionNumber", async () => {
            const campaignWithSession = { ...validCampaign, sessions: [validSession] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithSession);
            
            const changedNumber = { ...validSession, sessionNumber: 99 };
            await expect(updateSession(mockCampaignRepository, validCampaign.id, changedNumber)).rejects.toThrow(
                "No se puede cambiar el número de sesión"
            );
        });
    });

    describe("removeSession", () => {
        it("should remove a session successfully", async () => {
            const campaignWithSession = { ...validCampaign, sessions: [validSession] };
            const campaignWithoutSession = { ...validCampaign, sessions: [] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithSession);
            vi.mocked(mockCampaignRepository.removeSession).mockResolvedValue(campaignWithoutSession);
            
            await removeSession(mockCampaignRepository, validCampaign.id, validSession.id);
            
            expect(mockCampaignRepository.removeSession).toHaveBeenCalledWith(validCampaign.id, validSession.id);
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);
            
            await expect(removeSession(mockCampaignRepository, validCampaign.id, validSession.id)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });


    // ========================================
    // Character Operations
    // ========================================

    describe("assignCharacter", () => {
        it("should assign character to campaign", async () => {
            const fullCharacter = {
                id: validCharacterRef.id,
                name: validCharacterRef.name,
                classType: validCharacterRef.classType,
                level: validCharacterRef.level,
                hitPoints: 100,
                age: 'adult' as const,
                isNPC: false,
                createdAt: new Date(),
                updatedAt: undefined,
            };
            const campaignWithCharacter = { ...validCampaign, characters: [validCharacterRef] };
            
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(fullCharacter);
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.addCharacter).mockResolvedValue(campaignWithCharacter);
            
            const result = await assignCharacter(
                mockCampaignRepository,
                mockCharacterRepository,
                validCampaign.id,
                validCharacterRef.id
            );
            
            expect(result).toEqual(validCharacterRef);
            expect(mockCampaignRepository.addCharacter).toHaveBeenCalledWith(validCampaign.id, validCharacterRef);
        });

        it("should build CharacterRef snapshot from full character", async () => {
            const fullCharacter = {
                id: 'char-1',
                name: 'Gandalf',
                classType: 'Wizard' as const,
                level: 10,
                hitPoints: 100,
                age: 'adult' as const,
                isNPC: false,
                createdAt: new Date(),
                updatedAt: undefined,
            };
            
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(fullCharacter);
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.addCharacter).mockResolvedValue(validCampaign);
            
            await assignCharacter(mockCampaignRepository, mockCharacterRepository, validCampaign.id, 'char-1');
            
            expect(mockCampaignRepository.addCharacter).toHaveBeenCalledWith(
                validCampaign.id,
                expect.objectContaining({
                    id: 'char-1',
                    name: 'Gandalf',
                    classType: 'Wizard',
                    level: 10,
                })
            );
        });

        it("should throw when character already assigned", async () => {
            const campaignWithCharacter = { ...validCampaign, characters: [validCharacterRef] };
            const fullCharacter = {
                ...validCharacterRef,
                hitPoints: 100,
                age: 'adult' as const,
                isNPC: false,
                createdAt: new Date(),
                updatedAt: undefined,
            };
            
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(fullCharacter);
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithCharacter);
            
            await expect(assignCharacter(
                mockCampaignRepository,
                mockCharacterRepository,
                validCampaign.id,
                validCharacterRef.id
            )).rejects.toThrow("El personaje ya está asignado a esta campaña");
        });

        it("should throw when character not found", async () => {
            vi.mocked(mockCharacterRepository.getCharacterById).mockResolvedValue(null);
            
            await expect(assignCharacter(
                mockCampaignRepository,
                mockCharacterRepository,
                validCampaign.id,
                'non-existent-char'
            )).rejects.toThrow("Personaje no encontrado");
        });
    });

    describe("removeCharacter", () => {
        it("should remove character from campaign", async () => {
            const campaignWithCharacter = { ...validCampaign, characters: [validCharacterRef] };
            const campaignWithoutCharacter = { ...validCampaign, characters: [] };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithCharacter);
            vi.mocked(mockCampaignRepository.removeCharacter).mockResolvedValue(campaignWithoutCharacter);
            
            await removeCharacter(mockCampaignRepository, validCampaign.id, validCharacterRef.id);
            
            expect(mockCampaignRepository.removeCharacter).toHaveBeenCalledWith(validCampaign.id, validCharacterRef.id);
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);
            
            await expect(removeCharacter(mockCampaignRepository, validCampaign.id, validCharacterRef.id)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });


    // ========================================
    // Group Operations
    // ========================================

    describe("assignGroup", () => {
        it("should assign group snapshot to campaign", async () => {
            const fullGroup = {
                id: validGroupSnapshot.id,
                name: validGroupSnapshot.name,
                description: validGroupSnapshot.description,
                members: [
                    {
                        id: 'char-1',
                        name: 'Gandalf',
                        classType: 'Wizard' as const,
                    }
                ],
                createdAt: new Date(),
            };
            const campaignWithGroup = { ...validCampaign, group: validGroupSnapshot };
            
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(fullGroup);
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.assignGroup).mockResolvedValue(campaignWithGroup);
            
            const result = await assignGroup(
                mockCampaignRepository,
                mockGroupRepository,
                validCampaign.id,
                validGroupSnapshot.id
            );
            
            expect(result.id).toBe(validGroupSnapshot.id);
            expect(result.snapshotAt).toBeInstanceOf(Date);
            expect(mockCampaignRepository.assignGroup).toHaveBeenCalledWith(
                validCampaign.id,
                expect.objectContaining({
                    id: validGroupSnapshot.id,
                    name: validGroupSnapshot.name,
                    snapshotAt: expect.any(Date),
                })
            );
        });

        it("should build GroupSnapshot from full group", async () => {
            const fullGroup = {
                id: 'group-1',
                name: 'The Fellowship',
                description: 'A fellowship of adventurers',
                members: [
                    {
                        id: 'char-1',
                        name: 'Gandalf',
                        classType: 'Wizard' as const,
                    }
                ],
                createdAt: new Date(),
            };
            
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(fullGroup);
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.assignGroup).mockResolvedValue(validCampaign);
            
            await assignGroup(mockCampaignRepository, mockGroupRepository, validCampaign.id, 'group-1');
            
            expect(mockCampaignRepository.assignGroup).toHaveBeenCalledWith(
                validCampaign.id,
                expect.objectContaining({
                    id: 'group-1',
                    name: 'The Fellowship',
                    description: 'A fellowship of adventurers',
                    members: expect.arrayContaining([
                        expect.objectContaining({
                            id: 'char-1',
                            name: 'Gandalf',
                            classType: 'Wizard',
                        })
                    ]),
                    snapshotAt: expect.any(Date),
                })
            );
        });

        it("should throw when group not found", async () => {
            vi.mocked(mockGroupRepository.getGroupById).mockResolvedValue(null);
            
            await expect(assignGroup(
                mockCampaignRepository,
                mockGroupRepository,
                validCampaign.id,
                'non-existent-group'
            )).rejects.toThrow("Grupo no encontrado");
        });
    });

    describe("removeGroup", () => {
        it("should remove group from campaign", async () => {
            const campaignWithGroup = { ...validCampaign, group: validGroupSnapshot };
            const campaignWithoutGroup = { ...validCampaign, group: null };
            
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithGroup);
            vi.mocked(mockCampaignRepository.removeGroup).mockResolvedValue(campaignWithoutGroup);
            
            await removeGroup(mockCampaignRepository, validCampaign.id);
            
            expect(mockCampaignRepository.removeGroup).toHaveBeenCalledWith(validCampaign.id);
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);
            
            await expect(removeGroup(mockCampaignRepository, validCampaign.id)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });

    // ========================================
    // Note Operations
    // ========================================

    describe("addNote", () => {
        it("should add a note with generated UUID and createdAt", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);
            vi.mocked(mockCampaignRepository.addNote).mockResolvedValue({
                ...validCampaign, notes: [validNote]
            });

            const { id, createdAt, ...noteData } = validNote;
            const result = await addNote(mockCampaignRepository, validCampaign.id, noteData);

            expect(result.id).toBeDefined();
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.comment).toBe(validNote.comment);
            expect(result.color).toBe(validNote.color);
        });

        it("should throw when comment is empty", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);

            await expect(addNote(mockCampaignRepository, validCampaign.id, {
                comment: '', color: 'yellow'
            })).rejects.toThrow();
            expect(mockCampaignRepository.addNote).not.toHaveBeenCalled();
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);

            const { id, createdAt, ...noteData } = validNote;
            await expect(addNote(mockCampaignRepository, validCampaign.id, noteData)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });

        it("should throw when campaign not found", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(null);

            const { id, createdAt, ...noteData } = validNote;
            await expect(addNote(mockCampaignRepository, 'non-existent', noteData)).rejects.toThrow(
                "Campaña no encontrada"
            );
        });
    });

    describe("removeNote", () => {
        it("should remove a note successfully", async () => {
            const campaignWithNote = { ...validCampaign, notes: [validNote] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithNote);
            vi.mocked(mockCampaignRepository.removeNote).mockResolvedValue({
                ...validCampaign, notes: []
            });

            await removeNote(mockCampaignRepository, validCampaign.id, validNote.id);

            expect(mockCampaignRepository.removeNote).toHaveBeenCalledWith(
                validCampaign.id, validNote.id
            );
        });

        it("should throw when campaign is Finalizada", async () => {
            const finishedCampaign = { ...validCampaign, status: 'Finalizada' as const };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(finishedCampaign);

            await expect(removeNote(mockCampaignRepository, validCampaign.id, validNote.id)).rejects.toThrow(
                "No se pueden realizar cambios en una campaña finalizada"
            );
        });
    });

    describe("getNotes", () => {
        it("should return all notes sorted by createdAt desc", async () => {
            const olderNote = { ...validNote, id: 'note-old', createdAt: new Date('2026-01-01') };
            const newerNote = { ...validNote, id: 'note-new', createdAt: new Date('2026-03-15') };
            const campaignWithNotes = { ...validCampaign, notes: [olderNote, newerNote] };
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(campaignWithNotes);

            const result = await getNotes(mockCampaignRepository, validCampaign.id);

            expect(result[0].id).toBe('note-new');
            expect(result[1].id).toBe('note-old');
        });

        it("should return empty array when campaign has no notes", async () => {
            vi.mocked(mockCampaignRepository.getCampaignById).mockResolvedValue(validCampaign);

            const result = await getNotes(mockCampaignRepository, validCampaign.id);

            expect(result).toEqual([]);
        });
    });
});
