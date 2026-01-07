import { createMission, deleteMission, getAllMissions, getMissionById, updateMission } from "@/application/useCases/mission";
import { Mission } from "@/domain/mission/mission";
import { MissionRespository } from "@/domain/mission/MissionRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe('Testing use case missions', () => {
    const mockMissionRepository: MissionRespository = {
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
        it('Should create a mission successfully', async () => {
            //Arrange
            const mission: Mission = {
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
            vi.mocked(mockMissionRepository.createMission).mockResolvedValue(mission);

            //Act
            const result = await createMission(mockMissionRepository, mission);

            //Assert
            expect(result.id).not.toBeNull();
            expect(result.name).toBe(mission.name);
            expect(result.description).toBe(mission.description);
            expect(result.missionGuide).toBe(mission.missionGuide);
            expect(result.missionEvents).not.toBeNull();
            expect(result.missionPriority).toBe(mission.missionPriority);
            expect(result.rewards).toBe(mission.rewards);
            expect(result.relatedCharacters).not.toBeNull();
            expect(result.startDate).toBe(mission.startDate);
            expect(result.endDate).toBe(undefined);
            expect(result.status).toBe(mission.status);

        });
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
    })

    describe('Get mission by id', () => {
        it('Must return one mission passing an id', () => {
            //Arrange
            const mission: Mission = {
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
            vi.mocked(mockMissionRepository.getMissionById).mockResolvedValue(mission);

            //Act
            const result = getMissionById(mockMissionRepository, '2');

            //Assert
            expect(result).resolves.toEqual(mission)
        })
    })

    describe('Get All missions', () => {
        it('Must return a mission list', () => {
            //Arrange
            const missions: Mission[] = [{
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
            vi.mocked(mockMissionRepository.getAllMissions).mockResolvedValue(missions);

            //Act
            const result = getAllMissions(mockMissionRepository)

            //Assert
            expect(result).resolves.toEqual(missions);
        })
    })

    describe('Update mission', () => {
        it('Updata mission by id', async () => {
            const mission: Mission = {
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
            //Arrange
            const updateDataMission = { ...mission, name: 'Snake Eater' }
            vi.mocked(mockMissionRepository.getMissionById).mockResolvedValue(mission);
            vi.mocked(mockMissionRepository.updateMission).mockResolvedValue(updateDataMission);

            //Act
            const result = await updateMission(mockMissionRepository, updateDataMission)

            //Assert
            expect(result?.name).toBe('Snake Eater');
            expect(mockMissionRepository.updateMission).toHaveBeenCalledOnce();
        })
    })
})