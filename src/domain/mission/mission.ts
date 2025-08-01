export interface Mission {
    id: string; 
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: MissionStatusType
}

export enum MissionStatus {
  Activa = 'Activa',
  Pausada = 'Pausada',
  Finalizada = 'Finalizada',
}

export type MissionStatusType = keyof typeof MissionStatus;