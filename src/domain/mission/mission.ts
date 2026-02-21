export interface Mission {
    id: string; 
    name: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    status: MissionStatusType
}

export enum MissionStatus {
  Activa = 'Activa',
  Pausada = 'Pausada',
  Finalizada = 'Finalizada',
}

export const updateMissionParams = (missionToUpdate: Mission, updateParams : Partial<Mission>) : void => {
  missionToUpdate.description = updateParams.description ?? missionToUpdate.description
  missionToUpdate.name = updateParams.name ?? missionToUpdate.name
  missionToUpdate.status = updateParams.status ?? missionToUpdate.status
  missionToUpdate.endDate = updateParams.endDate ?? missionToUpdate.endDate
}

export const createNewMission = (newMision : Partial<Mission>) : Omit<Mission,"id"> =>({
  description: newMision.description ?? "",
  name: newMision.name ?? "name",
  status: newMision.status ?? 'Activa',
  startDate: newMision.startDate ?? null,
  endDate: null
})

export type MissionStatusType = keyof typeof MissionStatus;