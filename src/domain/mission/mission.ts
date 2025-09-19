import { Character } from "../character/character";

export interface Mission {
  id: string;
  name: string;
  description: string;
  missionGuide: string;
  missionEvents: TypeEvent[] | null;
  missionPriority: string;
  rewards: string | null;
  relatedCharacters: Pick<Character, "id" | "name">[] | null;
  startDate?: Date;
  endDate?: Date;
  status: MissionStatusType
}

type TypeEvent = {
  name: string;
  difficult: string;
}

export enum MissionStatus {
  Activa = 'Activa',
  Pausada = 'Pausada',
  Finalizada = 'Finalizada',
}

export type MissionStatusType = keyof typeof MissionStatus;


export const validateMission = (mission: Partial<Mission>): boolean => {

  if (!mission.name || mission.name.trim() === "") {
    throw new Error("Mission name is required");
  }
  if (!mission.description || mission.description.trim() === "") {
    throw new Error("Mission description is required");
  }
  if (!mission.missionGuide || mission.missionGuide.trim() === "") {
    throw new Error("Mission guide is required");
  }
  if (!mission.missionPriority || mission.missionPriority.trim() === "") {
    throw new Error("Mission priority is required");
  }

  return true;
}


export function validateMissions(missions: Mission[]){
    missions.forEach(mission => validateMission(mission))
}