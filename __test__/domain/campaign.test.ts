import { assertNotFinalizada, assertUniqueMissionName, Campaign, CampaignI, CharacterRef, EmbeddedItem, EmbeddedMission, EmbeddedNote, EmbeddedSession, GroupSnapshot, Inventory, MissionStatusType, validateCampaign, validateCharacterRef, validateEmbeddedItem, validateEmbeddedMission, validateEmbeddedNote, validateEmbeddedSession, validateGroupSnapshot, validateInventory } from "@/domain/campaign/campaign";
import { DnDClassType } from "@/domain/character/character";
import { describe, expect, it } from "vitest";

describe("Campaign domain", () => {
    const validSession: EmbeddedSession = {
        date: new Date(),
        id: 'session id',
        notes: 'test notes',
        sessionNumber: 1,
        title: 'test session title'
    }
    const validMission: EmbeddedMission = {
        description: 'mission test',
        id: 'missionid',
        missionEvents: [
            {
                difficult: 'high',
                name: 'test event',
            }
        ],
        missionGuide: 'test mission guide',
        missionPriority: 'high',
        name: "mission guide",
        relatedCharacters: [
            {
                id: 'id1',
                name: "relatedcharacter"
            },
        ],
        rewards: "test rewards",
        status: 'Activa',
    }
    const validGroup: GroupSnapshot = {
        description: 'Test group',
        id: 'idgroup',
        members: [
            {
                classType: "Bard",
                id: 'memberid',
                name: 'Var'
            }
        ],
        name: 'group name',
        snapshotAt: new Date()
    };
    const validCharacter: CharacterRef = {
        classType: 'Artificer',
        id: 'id1',
        level: 1,
        name: 'pato'
    }
    const validCampaignData: CampaignI = {
        id: "1",
        name: "The Lost Kingdom",
        description: "An epic adventure across the lost kingdom",
        status: "Activa",
        characters: [validCharacter],
        group: validGroup,
        missions: [validMission],
        sessions: [validSession],
        inventory: { items: [], capacity: 100, money: 0 },
        notes: [],
        discordSpeakerMappings: [],
    };

    describe("validateCampaign", () => {
        it("should return true for a valid campaign", () => {
            const result = validateCampaign(validCampaignData);
            expect(result).toBe(true);
        })

        it("should throw when name is missing", () => {
            const invalid = { ...validCampaignData, name: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("El nombre de la campaña no es válido, mínimo 3 caracteres");
        })

        it("should throw when name is null", () => {
            const invalid = { ...validCampaignData, name: null as any };
            expect(() => validateCampaign(invalid)).toThrow("El nombre de la campaña no es válido, mínimo 3 caracteres");
        })

        it("should throw when name is shorter than 3 characters", () => {
            const invalid = { ...validCampaignData, name: "ab" };
            expect(() => validateCampaign(invalid)).toThrow("El nombre de la campaña no es válido, mínimo 3 caracteres");
        })

        it("should accept name with exactly 3 characters", () => {
            const valid = { ...validCampaignData, name: "abc" };
            const result = validateCampaign(valid);
            expect(result).toBe(true);
        })

        it("should throw when description is missing", () => {
            const invalid = { ...validCampaignData, description: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("La descripción de la campaña no es válida, mínimo 3 caracteres");
        })

        it("should throw when description is null", () => {
            const invalid = { ...validCampaignData, description: null as any };
            expect(() => validateCampaign(invalid)).toThrow("La descripción de la campaña no es válida, mínimo 3 caracteres");
        })

        it("should throw when description is shorter than 3 characters", () => {
            const invalid = { ...validCampaignData, description: "ab" };
            expect(() => validateCampaign(invalid)).toThrow("La descripción de la campaña no es válida, mínimo 3 caracteres");
        })

        it("should throw when status is invalid", () => {
            const invalid = { ...validCampaignData, status: "Desconocido" as any };
            expect(() => validateCampaign(invalid)).toThrow("El estado de la campaña no es válido");
        })

        it("should throw when status is missing", () => {
            const invalid = { ...validCampaignData, status: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("El estado de la campaña no es válido");
        })

        it("should accept status 'Activa'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Activa" });
            expect(result).toBe(true);
        })

        it("should accept status 'Pausada'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Pausada" });
            expect(result).toBe(true);
        })

        it("should accept status 'Finalizada'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Finalizada" });
            expect(result).toBe(true);
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validCampaignData, name: "ab", description: "x", status: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("Errores en la campaña:");
        })
    })

    describe("validateEmbeddedSession", () => {
        it("should return true when is a valid session", () => {
            const result = validateEmbeddedSession(validSession);
            expect(result).toBe(true);
        })
    
        it("should throw when title length is lower than 3", ()=>{
            const invalid =  { ...validSession, title: "ab"};
            expect(()=> validateEmbeddedSession(invalid)).toThrow("El título de la sesión no es válido, mínimo 3 caracteres")
        })
        it("should throw when title is missing", ()=>{
            const invalid =  { ...validSession, title: undefined};
            expect(()=> validateEmbeddedSession(invalid)).toThrow("El título de la sesión no es válido, mínimo 3 caracteres")
        })

        it("should throw when notes is missing", ()=>{
            const invalid =  { ...validSession, notes: undefined};
            expect(()=> validateEmbeddedSession(invalid)).toThrow("Las notas de la sesión no son válidas, mínimo 3 caracteres")
        })

        it("should throw when sessionNumber is negative", () => {
            const invalid = { ...validSession, sessionNumber: -1 };
            expect(() => validateEmbeddedSession(invalid)).toThrow("El número de sesión debe ser mayor o igual a 1");
        })
        it("should throw when sessionNumber is zero", () => {
            const invalid = { ...validSession, sessionNumber: 0 };
            expect(() => validateEmbeddedSession(invalid)).toThrow("El número de sesión debe ser mayor o igual a 1");
        })

        it("should throw when sessionNumber is missing", () => {
            const invalid = { ...validSession, sessionNumber: undefined };
            expect(() => validateEmbeddedSession(invalid)).toThrow("El número de sesión debe ser mayor o igual a 1");
        })
        it("should throw when date is missing", () => {
            const invalid = { ...validSession, date: undefined };
            expect(() => validateEmbeddedSession(invalid)).toThrow("La fecha de la sesión es requerida");
        })
  
        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validSession, sessionNumber: undefined, date:undefined };
            expect(() => validateEmbeddedSession(invalid)).toThrow("Errores en la sesión");
        })
    })
    describe("validateEmbeddMission", () => {
        it("should return true when is a valid mission", () => {
            const result = validateEmbeddedMission(validMission);
            expect(result).toBe(true);
        })
    
        it("should throw when name length is lower than 3", ()=>{
            const invalid =  { ...validMission, name: "ab"};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("El nombre de la misión no es válido, mínimo 3 caracteres")
        })
        it("should throw when name is missing", ()=>{
            const invalid =  { ...validMission, name: undefined};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("El nombre de la misión no es válido, mínimo 3 caracteres")
        })
        it("should throw when description length is lower than 3", ()=>{
            const invalid =  { ...validMission, description: "ab"};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("La descripción de la misión no es válida, mínimo 3 caracteres")
        })
        it("should throw when description is missing", ()=>{
            const invalid =  { ...validMission, description: undefined};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("La descripción de la misión no es válida, mínimo 3 caracteres")
        })
        it("should throw when missionGuide length is lower than 3", ()=>{
            const invalid =  { ...validMission, missionGuide: "ab"};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("La guía de la misión no es válida, mínimo 3 caracteres")
        })
        it("should throw when missionGuide is missing", ()=>{
            const invalid =  { ...validMission, missionGuide: undefined};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("La guía de la misión no es válida, mínimo 3 caracteres")
        })
        it("should throw when missionPriority is missing", ()=>{
            const invalid =  { ...validMission, missionPriority: undefined};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("La prioridad de la misión es requerida")
        })
        it("should throw when status is invalid empty string", ()=>{
            const invalid =  { ...validMission, status: "" as MissionStatusType};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("El estado de la misión no es válido")
        })
        it("should throw when status is unknown", ()=>{
            const invalid =  { ...validMission, status: "desconocido" as MissionStatusType};
            expect(()=> validateEmbeddedMission(invalid)).toThrow("El estado de la misión no es válido")
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validMission, missionGuide: undefined, description: "ab" };
            expect(() => validateEmbeddedMission(invalid)).toThrow("Errores en la misión");
        })
    })
    describe("validateCharacterRef", () => {
        it("should return true when is a valid validateCharacterRef", () => {
            const result = validateCharacterRef(validCharacter);
            expect(result).toBe(true);
        })
    
        it("should throw when name length is lower than 2", ()=>{
            const invalid =  { ...validCharacter, name: "a"};
            expect(()=> validateCharacterRef(invalid)).toThrow("El nombre del personaje no es válido, mínimo 2 caracteres")
        })
        it("should throw when name is missing", ()=>{
            const invalid =  { ...validCharacter, name: undefined};
            expect(()=> validateCharacterRef(invalid)).toThrow("El nombre del personaje no es válido, mínimo 2 caracteres")
        })
        it("should throw when id length is empty", ()=>{
            const invalid =  { ...validCharacter, id: ""};
            expect(()=> validateCharacterRef(invalid)).toThrow("El ID del personaje es requerido")
        })
        it("should throw when id is missing", ()=>{
            const invalid =  { ...validCharacter, id: undefined};
            expect(()=> validateCharacterRef(invalid)).toThrow("El ID del personaje es requerido")
        })
        it("should throw when classType length is empty", ()=>{
            const invalid =  { ...validCharacter, classType: "" as DnDClassType};
            expect(()=> validateCharacterRef(invalid)).toThrow("La clase del personaje es requerida")
        })
        it("should throw when classType is missing", ()=>{
            const invalid =  { ...validCharacter, classType: undefined};
            expect(()=> validateCharacterRef(invalid)).toThrow("La clase del personaje es requerida")
        })
        it("should throw when level is less than 1", ()=>{
            const invalid =  { ...validCharacter, level: 0};
            expect(()=> validateCharacterRef(invalid)).toThrow("El nivel del personaje debe ser 1 o mayor")
        })
        it("should throw when level is missing", ()=>{
            const invalid =  { ...validCharacter, level: undefined};
            expect(()=> validateCharacterRef(invalid)).toThrow("El nivel del personaje debe ser 1 o mayor")
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validCharacter, name: "a", id: undefined};
            expect(() => validateCharacterRef(invalid)).toThrow("Errores en la referencia del personaje");
        })
    })

    describe("validateGroupSnapshot", () => {
        it("should return true when is a valid group snapshot", () => {
            const result = validateGroupSnapshot(validGroup);
            expect(result).toBe(true);
        })

        it("should throw when id is missing", () => {
            const invalid = { ...validGroup, id: undefined };
            expect(() => validateGroupSnapshot(invalid)).toThrow("El ID del grupo es requerido");
        })

        it("should throw when id is empty", () => {
            const invalid = { ...validGroup, id: "" };
            expect(() => validateGroupSnapshot(invalid)).toThrow("El ID del grupo es requerido");
        })

        it("should throw when name is missing", () => {
            const invalid = { ...validGroup, name: undefined };
            expect(() => validateGroupSnapshot(invalid)).toThrow("El nombre del grupo no es válido, mínimo 3 caracteres");
        })

        it("should throw when name is too short", () => {
            const invalid = { ...validGroup, name: "ab" };
            expect(() => validateGroupSnapshot(invalid)).toThrow("El nombre del grupo no es válido, mínimo 3 caracteres");
        })

        it("should throw when description is missing", () => {
            const invalid = { ...validGroup, description: undefined };
            expect(() => validateGroupSnapshot(invalid)).toThrow("La descripción del grupo no es válida, mínimo 3 caracteres");
        })

        it("should throw when description is too short", () => {
            const invalid = { ...validGroup, description: "ab" };
            expect(() => validateGroupSnapshot(invalid)).toThrow("La descripción del grupo no es válida, mínimo 3 caracteres");
        })

        it("should throw when members is missing", () => {
            const invalid = { ...validGroup, members: undefined };
            expect(() => validateGroupSnapshot(invalid)).toThrow("Los miembros del grupo son requeridos");
        })

        it("should throw when members is not an array", () => {
            const invalid = { ...validGroup, members: "not-an-array" as any };
            expect(() => validateGroupSnapshot(invalid)).toThrow("Los miembros del grupo son requeridos");
        })

        it("should throw when snapshotAt is missing", () => {
            const invalid = { ...validGroup, snapshotAt: undefined };
            expect(() => validateGroupSnapshot(invalid)).toThrow("La fecha de snapshot es requerida");
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validGroup, id: "", name: "ab" };
            expect(() => validateGroupSnapshot(invalid)).toThrow("Errores en el snapshot del grupo");
        })
    })

    describe("assertNotFinalizada", () => {
        it("should not throw when campaign status is Activa", () => {
            const campaign = { ...validCampaignData, status: "Activa" as const };
            expect(() => assertNotFinalizada(campaign)).not.toThrow();
        })

        it("should not throw when campaign status is Pausada", () => {
            const campaign = { ...validCampaignData, status: "Pausada" as const };
            expect(() => assertNotFinalizada(campaign)).not.toThrow();
        })

        it("should throw when campaign status is Finalizada", () => {
            const campaign = { ...validCampaignData, status: "Finalizada" as const };
            expect(() => assertNotFinalizada(campaign)).toThrow("No se pueden realizar cambios en una campaña finalizada");
        })
    })

    describe("assertUniqueMissionName", () => {
        const missions: EmbeddedMission[] = [
            { ...validMission, id: "mission-1", name: "Rescue the Princess" },
            { ...validMission, id: "mission-2", name: "Find the Artifact" }
        ];

        it("should not throw when name is unique", () => {
            expect(() => assertUniqueMissionName(missions, "New Mission")).not.toThrow();
        })

        it("should throw when name already exists (case-insensitive)", () => {
            expect(() => assertUniqueMissionName(missions, "rescue the princess")).toThrow(
                'Ya existe una misión con el nombre "rescue the princess" en esta campaña'
            );
        })

        it("should not throw when name matches but excludeId is provided", () => {
            expect(() => assertUniqueMissionName(missions, "Rescue the Princess", "mission-1")).not.toThrow();
        })

        it("should throw when name matches different mission even with excludeId", () => {
            expect(() => assertUniqueMissionName(missions, "Rescue the Princess", "mission-2")).toThrow(
                'Ya existe una misión con el nombre "Rescue the Princess" en esta campaña'
            );
        })
    })

    describe("Campaign.updateCampaign()", () => {
        it("should update the name when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ name: "New Name" });
            expect(campaign.name).toBe("New Name");
        })

        it("should update the description when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ description: "New description for campaign" });
            expect(campaign.description).toBe("New description for campaign");
        })

        it("should update the status when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ status: "Finalizada" });
            expect(campaign.status).toBe("Finalizada");
        })

        it("should update nextSessionAt when provided", () => {
            const campaign = new Campaign(validCampaignData);
            const nextDate = new Date("2026-05-01");
            campaign.updateCampaign({ nextSessionAt: nextDate });
            expect(campaign.nextSessionAt).toEqual(nextDate);
        })

        it("should update lastSessionAt when provided", () => {
            const campaign = new Campaign(validCampaignData);
            const lastDate = new Date("2026-04-01");
            campaign.updateCampaign({ lastSessionAt: lastDate });
            expect(campaign.lastSessionAt).toEqual(lastDate);
        })

        it("should not change name if not provided in partial update", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ description: "Updated description text" });
            expect(campaign.name).toBe(validCampaignData.name);
        })

        it("should set updatedAt to a Date after calling updateCampaign", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.updatedAt).toBeUndefined();
            campaign.updateCampaign({ name: "Updated" });
            expect(campaign.updatedAt).toBeInstanceOf(Date);
        })

        it("should apply multiple partial updates at once", () => {
            const campaign = new Campaign(validCampaignData);
            const nextDate = new Date("2026-06-01");
            campaign.updateCampaign({ name: "Multi Update", status: "Pausada", nextSessionAt: nextDate });
            expect(campaign.name).toBe("Multi Update");
            expect(campaign.status).toBe("Pausada");
            expect(campaign.nextSessionAt).toEqual(nextDate);
        })

        it("should not update name if empty string is provided (falsy guard)", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ name: "" });
            expect(campaign.name).toBe(validCampaignData.name);
        })

        it("should NOT mutate missions array (managed via repository)", () => {
            const campaign = new Campaign(validCampaignData);
            const originalMissions = campaign.missions;
            campaign.updateCampaign({ name: "Updated Name" });
            expect(campaign.missions).toBe(originalMissions);
        })

        it("should NOT mutate sessions array (managed via repository)", () => {
            const campaign = new Campaign(validCampaignData);
            const originalSessions = campaign.sessions;
            campaign.updateCampaign({ name: "Updated Name" });
            expect(campaign.sessions).toBe(originalSessions);
        })

        it("should NOT mutate characters array (managed via repository)", () => {
            const campaign = new Campaign(validCampaignData);
            const originalCharacters = campaign.characters;
            campaign.updateCampaign({ name: "Updated Name" });
            expect(campaign.characters).toBe(originalCharacters);
        })

        it("should NOT mutate group (managed via repository)", () => {
            const campaign = new Campaign(validCampaignData);
            const originalGroup = campaign.group;
            campaign.updateCampaign({ name: "Updated Name" });
            expect(campaign.group).toBe(originalGroup);
        })
    })

    const validItem: EmbeddedItem = {
        id: 'item-1',
        title: 'Sword of Destiny',
        description: 'A legendary sword',
        quantity: 1,
        value: 50,
        tags: ['common'],
    };

    describe("validateEmbeddedItem", () => {
        it("should return true for a valid item", () => {
            const result = validateEmbeddedItem(validItem);
            expect(result).toBe(true);
        })

        it("should throw when title is missing or empty", () => {
            const invalid = { ...validItem, title: "" };
            expect(() => validateEmbeddedItem(invalid)).toThrow("El nombre del objeto es requerido");
        })

        it("should throw when description is missing or empty", () => {
            const invalid = { ...validItem, description: "" };
            expect(() => validateEmbeddedItem(invalid)).toThrow("La descripción del objeto es requerida");
        })

        it("should throw when quantity is negative", () => {
            const invalid = { ...validItem, quantity: -1 };
            expect(() => validateEmbeddedItem(invalid)).toThrow("La cantidad debe ser 0 o mayor");
        })

        it("should throw when tags is missing or not an array", () => {
            const invalid = { ...validItem, tags: undefined as any };
            expect(() => validateEmbeddedItem(invalid)).toThrow("Las etiquetas deben ser un array");
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validItem, title: "", description: "", quantity: -1 };
            expect(() => validateEmbeddedItem(invalid)).toThrow("Errores en el objeto:");
        })
    })

    describe("validateInventory", () => {
        const validInventory: Inventory = {
            items: [],
            capacity: 100,
            money: 0,
        };

        it("should return true for a valid inventory", () => {
            const result = validateInventory(validInventory);
            expect(result).toBe(true);
        })

        it("should throw when capacity is negative", () => {
            const invalid = { ...validInventory, capacity: -1 };
            expect(() => validateInventory(invalid)).toThrow("La capacidad del inventario debe ser 0 o mayor");
        })

        it("should throw when money is negative", () => {
            const invalid = { ...validInventory, money: -1 };
            expect(() => validateInventory(invalid)).toThrow("El dinero debe ser un número igual o mayor a 0");
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validInventory, capacity: -1, money: -5 };
            expect(() => validateInventory(invalid)).toThrow("Errores en el inventario:");
        })
    })

    describe("Campaign constructor — inventory", () => {
        it("should initialize inventory from data when provided", () => {
            const inventoryData: Inventory = { items: [validItem], capacity: 50, money: 200 };
            const campaign = new Campaign({ ...validCampaignData, inventory: inventoryData });
            expect(campaign.inventory).toEqual(inventoryData);
        })

        it("should initialize default inventory when not provided", () => {
            const dataWithoutInventory = { ...validCampaignData, inventory: undefined as any };
            const campaign = new Campaign(dataWithoutInventory);
            expect(campaign.inventory).toEqual({ capacity: 100, items: [], money: 0 });
        })

        it("should NOT mutate inventory when updateCampaign is called (managed via repository)", () => {
            const inventoryData: Inventory = { items: [validItem], capacity: 50, money: 200 };
            const campaign = new Campaign({ ...validCampaignData, inventory: inventoryData });
            const originalInventory = campaign.inventory;
            campaign.updateCampaign({ name: "Updated Name" });
            expect(campaign.inventory).toBe(originalInventory);
        })
    })

    describe("Campaign constructor", () => {
        it("should set createdAt to a Date when not provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.createdAt).toBeInstanceOf(Date);
        })

        it("should preserve createdAt when provided", () => {
            const createdAt = new Date("2025-01-01");
            const campaign = new Campaign({ ...validCampaignData, createdAt });
            expect(campaign.createdAt).toEqual(createdAt);
        })

        it("should initialize group from data when provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.group).toEqual(validGroup);
        })

        it("should initialize group as null when not provided", () => {
            const dataWithoutGroup = { ...validCampaignData, group: null };
            const campaign = new Campaign(dataWithoutGroup);
            expect(campaign.group).toBeNull();
        })

        it("should set updatedAt as undefined when not provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.updatedAt).toBeUndefined();
        })

        it("should initialize missions array from data", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.missions).toEqual([validMission]);
            expect(campaign.missions).toHaveLength(1);
        })

        it("should initialize empty missions array when not provided", () => {
            const dataWithoutMissions = { ...validCampaignData, missions: [] };
            const campaign = new Campaign(dataWithoutMissions);
            expect(campaign.missions).toEqual([]);
        })

        it("should initialize sessions array from data", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.sessions).toEqual([validSession]);
            expect(campaign.sessions).toHaveLength(1);
        })

        it("should initialize empty sessions array when not provided", () => {
            const dataWithoutSessions = { ...validCampaignData, sessions: [] };
            const campaign = new Campaign(dataWithoutSessions);
            expect(campaign.sessions).toEqual([]);
        })

        it("should initialize characters array from data", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.characters).toEqual([validCharacter]);
            expect(campaign.characters).toHaveLength(1);
        })

        it("should initialize empty characters array when not provided", () => {
            const dataWithoutCharacters = { ...validCampaignData, characters: [] };
            const campaign = new Campaign(dataWithoutCharacters);
            expect(campaign.characters).toEqual([]);
        })

        it("should initialize empty notes array when not provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.notes).toEqual([]);
        })
    })

    // ========================================
    // validateEmbeddedNote
    // ========================================

    describe("validateEmbeddedNote", () => {
        const validNote: EmbeddedNote = {
            id: 'note-1',
            comment: 'Remember NPC Thornwick',
            color: 'yellow',
            createdAt: new Date(),
        };

        it("should return true for a valid note", () => {
            expect(validateEmbeddedNote(validNote)).toBe(true);
        })

        it("should throw when comment is empty", () => {
            const invalid = { ...validNote, comment: '' };
            expect(() => validateEmbeddedNote(invalid)).toThrow("El comentario de la nota no puede estar vacío");
        })

        it("should throw when comment is missing", () => {
            const invalid = { ...validNote, comment: undefined as any };
            expect(() => validateEmbeddedNote(invalid)).toThrow("El comentario de la nota no puede estar vacío");
        })

        it("should throw when color is invalid", () => {
            const invalid = { ...validNote, color: 'neon-pink' as any };
            expect(() => validateEmbeddedNote(invalid)).toThrow("El color de la nota no es válido");
        })

        it("should throw when color is missing", () => {
            const invalid = { ...validNote, color: undefined as any };
            expect(() => validateEmbeddedNote(invalid)).toThrow("El color de la nota no es válido");
        })

        it("should accept all valid colors", () => {
            const colors = ['yellow', 'blue', 'green', 'red', 'purple', 'gray'] as const;
            for (const color of colors) {
                expect(validateEmbeddedNote({ ...validNote, color })).toBe(true);
            }
        })
    })
})
