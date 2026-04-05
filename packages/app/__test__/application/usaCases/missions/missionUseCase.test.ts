import { createMission, deleteMission, getAllMissions, getMissionById, updateMission } from "@/application/useCases/mission";
import { Mission } from "@/domain/mission/mission";
import { MissionRepository } from "@/domain/mission/MissionRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe('Testing use case missions', () => {
    const mockMissionRepository: MissionRepository = {
        createMission: vi.fn(),
        getMissionById: vi.fn(),
        getAllMissions: vi.fn(),
        updateMission: vi.fn(),
        deleteMission: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Create mission', () => {
        const baseMission: Mission = {
            id: "1",
            name: "Bajando del cielo y sin frenos",
            description: "Una misteriosa nave ha descendido sin previo aviso en una zona remota. Tu equipo debe investigar el suceso, recopilar evidencia y evitar que fuerzas hostiles lleguen primero.",
            missionGuide: "Dirígete al sitio del impacto. Utiliza equipo especializado para entornos hostiles. Prioriza la seguridad del equipo y asegura cualquier tecnología recuperada.",
            missionEvents: [
                {
                    name: "Exploración inicial",
                    difficult: "Media"
                }
            ],
            missionPriority: "Alta",
            rewards: "5000 créditos, artefacto alienígena, +10 reputación con la Alianza Central",
            relatedCharacters: [
                {
                    id: "char_001",
                    name: "Zara Voss"
                }
            ],
            startDate: new Date("2025-09-18T08:00:00"),
            endDate: undefined,
            status: "Activa"
        };

        it('Should create a mission successfully', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.createMission).mockResolvedValue(baseMission);

            //Act
            const result = await createMission(mockMissionRepository, baseMission);

            //Assert
            expect(result.id).not.toBeNull();
            expect(result.name).toBe(baseMission.name);
            expect(result.description).toBe(baseMission.description);
            expect(result.missionGuide).toBe(baseMission.missionGuide);
            expect(result.missionEvents).not.toBeNull();
            expect(result.missionPriority).toBe(baseMission.missionPriority);
            expect(result.rewards).toBe(baseMission.rewards);
            expect(result.relatedCharacters).not.toBeNull();
            expect(result.startDate).toBe(baseMission.startDate);
            expect(result.endDate).toBe(undefined);
            expect(result.status).toBe(baseMission.status);
        });

        it('should throw "Mission name is required" when name is empty', async () => {
            //Arrange
            const invalidMission = { ...baseMission, name: "" };
            //Act
            const result = createMission(mockMissionRepository, invalidMission);
            //Assert
            await expect(result).rejects.toThrow("Mission name is required");
            expect(mockMissionRepository.createMission).not.toHaveBeenCalled();
        })

        it('should throw "Mission description is required" when description is empty', async () => {
            //Arrange
            const invalidMission = { ...baseMission, description: "" };
            //Act
            const result = createMission(mockMissionRepository, invalidMission);
            //Assert
            await expect(result).rejects.toThrow("Mission description is required");
            expect(mockMissionRepository.createMission).not.toHaveBeenCalled();
        })

        it('should throw "Mission guide is required" when missionGuide is empty', async () => {
            //Arrange
            const invalidMission = { ...baseMission, missionGuide: "" };
            //Act
            const result = createMission(mockMissionRepository, invalidMission);
            //Assert
            await expect(result).rejects.toThrow("Mission guide is required");
            expect(mockMissionRepository.createMission).not.toHaveBeenCalled();
        })

        it('should throw "Mission priority is required" when missionPriority is empty', async () => {
            //Arrange
            const invalidMission = { ...baseMission, missionPriority: "" };
            //Act
            const result = createMission(mockMissionRepository, invalidMission);
            //Assert
            await expect(result).rejects.toThrow("Mission priority is required");
            expect(mockMissionRepository.createMission).not.toHaveBeenCalled();
        })
    })

    describe('Delete mission', () => {
        it('Delete mision by id', async () => {
            //Arrange
            const validId: string = '1'
            vi.mocked(mockMissionRepository.deleteMission).mockResolvedValue(true);

            //Act
            const result = await deleteMission(mockMissionRepository, validId);

            //Assert
            expect(result).toBe(true);
            expect(mockMissionRepository.deleteMission).toHaveBeenCalledWith(validId);
        });

        it('should throw "Invalid group id" when id is null', async () => {
            //Act
            const result = deleteMission(mockMissionRepository, null as any);
            //Assert
            await expect(result).rejects.toThrow("Invalid group id");
            expect(mockMissionRepository.deleteMission).not.toHaveBeenCalled();
        })

        it('should throw "Invalid group id" when id is empty string', async () => {
            //Act
            const result = deleteMission(mockMissionRepository, "");
            //Assert
            await expect(result).rejects.toThrow("Invalid group id");
            expect(mockMissionRepository.deleteMission).not.toHaveBeenCalled();
        })

        it('should return false when repository returns false', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.deleteMission).mockResolvedValue(false);
            //Act
            const result = await deleteMission(mockMissionRepository, "1");
            //Assert
            expect(result).toBe(false);
        })
    })

    describe('Get mission by id', () => {
        const missionById: Mission = {
            id: "2",
            name: "El eco del vacío",
            description: "Una estación minera en el cinturón de Astora dejó de responder. Las últimas transmisiones indican comportamientos extraños entre el personal. Tu equipo debe abordar y evaluar la situación.",
            missionGuide: "Investiga la estación con extrema precaución. Evalúa signos de contaminación biológica o psicológica. Evita interacciones prolongadas sin evaluación médica.",
            missionEvents: [
                {
                    name: "Análisis de entorno",
                    difficult: "Alta"
                }
            ],
            missionPriority: "Crítica",
            rewards: "7500 créditos, tecnología experimental, +15 reputación con el Cuerpo Científico",
            relatedCharacters: [
                {
                    id: "char_014",
                    name: "Dr. Elias Marek"
                }
            ],
            startDate: new Date("2025-09-20T14:00:00"),
            endDate: undefined,
            status: "Activa"
        };

        it('Must return one mission passing an id', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.getMissionById).mockResolvedValue(missionById);

            //Act
            const result = getMissionById(mockMissionRepository, '2');

            //Assert
            await expect(result).resolves.toEqual(missionById)
        })

        it('should throw "Invalid group id" when id is null', async () => {
            //Act
            const result = getMissionById(mockMissionRepository, null as any);
            //Assert
            await expect(result).rejects.toThrow("Invalid group id");
            expect(mockMissionRepository.getMissionById).not.toHaveBeenCalled();
        })

        it('should throw "Invalid group id" when id is empty string', async () => {
            //Act
            const result = getMissionById(mockMissionRepository, "");
            //Assert
            await expect(result).rejects.toThrow("Invalid group id");
            expect(mockMissionRepository.getMissionById).not.toHaveBeenCalled();
        })

        it('should return null when mission is not found', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.getMissionById).mockResolvedValue(null);
            //Act
            const result = await getMissionById(mockMissionRepository, "non-existent");
            //Assert
            expect(result).toBeNull();
        })
    })

    describe('Get All missions', () => {
        const missionList: Mission[] = [{
            id: "2",
            name: "El eco del vacío",
            description: "Una estación minera en el cinturón de Astora dejó de responder. Las últimas transmisiones indican comportamientos extraños entre el personal. Tu equipo debe abordar y evaluar la situación.",
            missionGuide: "Investiga la estación con extrema precaución. Evalúa signos de contaminación biológica o psicológica. Evita interacciones prolongadas sin evaluación médica.",
            missionEvents: [
                {
                    name: "Análisis de entorno",
                    difficult: "Alta"
                }
            ],
            missionPriority: "Crítica",
            rewards: "7500 créditos, tecnología experimental, +15 reputación con el Cuerpo Científico",
            relatedCharacters: [
                {
                    id: "char_014",
                    name: "Dr. Elias Marek"
                }
            ],
            startDate: new Date("2025-09-20T14:00:00"),
            endDate: undefined,
            status: "Activa"
        }]

        it('Must return a mission list', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.getAllMissions).mockResolvedValue(missionList);

            //Act
            const result = getAllMissions(mockMissionRepository)

            //Assert
            await expect(result).resolves.toEqual(missionList);
        })

        it('should return an empty array when there are no missions', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.getAllMissions).mockResolvedValue([]);
            //Act
            const result = await getAllMissions(mockMissionRepository);
            //Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        })

        it('should throw "Failed to fetch missions" when repository throws', async () => {
            //Arrange
            vi.mocked(mockMissionRepository.getAllMissions).mockRejectedValue(new Error("DB error"));
            //Act
            const result = getAllMissions(mockMissionRepository);
            //Assert
            await expect(result).rejects.toThrow("Failed to fetch missions");
        })
    })

    describe('Update mission', () => {
        const missionToUpdate: Mission = {
            id: "2",
            name: "El eco del vacío",
            description: "Una estación minera en el cinturón de Astora dejó de responder. Las últimas transmisiones indican comportamientos extraños entre el personal. Tu equipo debe abordar y evaluar la situación.",
            missionGuide: "Investiga la estación con extrema precaución. Evalúa signos de contaminación biológica o psicológica. Evita interacciones prolongadas sin evaluación médica.",
            missionEvents: [
                {
                    name: "Análisis de entorno",
                    difficult: "Alta"
                }
            ],
            missionPriority: "Crítica",
            rewards: "7500 créditos, tecnología experimental, +15 reputación con el Cuerpo Científico",
            relatedCharacters: [
                {
                    id: "char_014",
                    name: "Dr. Elias Marek"
                }
            ],
            startDate: new Date("2025-09-20T14:00:00"),
            endDate: undefined,
            status: "Activa"
        };

        it('Updata mission by id', async () => {
            //Arrange
            const updateDataMission = { ...missionToUpdate, name: 'Snake Eater' }
            vi.mocked(mockMissionRepository.getMissionById).mockResolvedValue(missionToUpdate);
            vi.mocked(mockMissionRepository.updateMission).mockResolvedValue(updateDataMission);

            //Act
            const result = await updateMission(mockMissionRepository, updateDataMission)

            //Assert
            expect(result?.name).toBe('Snake Eater');
            expect(mockMissionRepository.updateMission).toHaveBeenCalledOnce();
        })

        it('should throw "Invalid mission data or ID" when id is missing', async () => {
            //Arrange
            const missionWithoutId = { ...missionToUpdate, id: "" };
            //Act
            const result = updateMission(mockMissionRepository, missionWithoutId);
            //Assert
            await expect(result).rejects.toThrow("Invalid mission data or ID");
            expect(mockMissionRepository.updateMission).not.toHaveBeenCalled();
        })

        it('should throw "Invalid mission data or ID" when id is null', async () => {
            //Arrange
            const missionWithNullId = { ...missionToUpdate, id: null as any };
            //Act
            const result = updateMission(mockMissionRepository, missionWithNullId);
            //Assert
            await expect(result).rejects.toThrow("Invalid mission data or ID");
            expect(mockMissionRepository.updateMission).not.toHaveBeenCalled();
        })
    })
})