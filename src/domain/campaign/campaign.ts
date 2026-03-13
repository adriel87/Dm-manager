import { Group } from "../group/group";

export interface CampaignI {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  sessions: number;
  nextSessionAt?: Date;
  lastSessionAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CampaignStatus {
  Activa = "Activa",
  Pausada = "Pausada",
  Finalizada = "Finalizada",
}

export type CampaignStatusType = keyof typeof CampaignStatus;

export class Campaign implements CampaignI {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  sessions: number;
  groups: Array<Pick<Group, "id" | "name">>;
  nextSessionAt?: Date | undefined;
  lastSessionAt?: Date | undefined;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(campaign: CampaignI) {
    this.id = campaign.id;
    this.name = campaign.name;
    this.description = campaign.description;
    this.status = campaign.status;
    this.sessions = campaign.sessions;
    this.nextSessionAt = campaign.nextSessionAt ?? undefined;
    this.lastSessionAt = campaign.lastSessionAt ?? undefined;
    this.createdAt = campaign.createdAt || new Date();
    this.updatedAt = campaign.updatedAt;
    this.groups = [];
  }

  updateCampaign(partialCampaign: Partial<CampaignI>) {
    if (partialCampaign.name) this.name = partialCampaign.name;
    if (partialCampaign.status) this.status = partialCampaign.status;
    if (partialCampaign.description)
      this.description = partialCampaign.description;
    if (partialCampaign.nextSessionAt)
      this.nextSessionAt = partialCampaign.nextSessionAt;
    if (partialCampaign.lastSessionAt)
      this.lastSessionAt = partialCampaign.lastSessionAt;
    if (partialCampaign.sessions) this.sessions = partialCampaign.sessions;

    this.updatedAt = new Date();
  }
}

export const validateCampaign = (partialCampaign: Partial<CampaignI>) => {
  const errors: Array<string> = [];
  if (
    partialCampaign.name === null ||
    partialCampaign.name === undefined ||
    partialCampaign.name.length < 3
  ) {
    errors.push("El nombre de la campaña no es válido, mínimo 3 caracteres");
  }
  if (
    partialCampaign.status === null ||
    partialCampaign.status === undefined ||
    !(partialCampaign.status in CampaignStatus)
  ) {
    errors.push("El estado de la campaña no es válido");
  }
  if (
    partialCampaign.description === null ||
    partialCampaign.description === undefined ||
    partialCampaign.description.length < 3
  ) {
    errors.push(
      "La descripción de la campaña no es válida, mínimo 3 caracteres",
    );
  }
  if (
    partialCampaign.sessions === null ||
    partialCampaign.sessions === undefined ||
    partialCampaign.sessions < 0
  ) {
    errors.push("El número de sesiones no es válido");
  }
  if (errors.length > 0) {
    throw new Error(`Errores en la campaña:\n${errors.join("\n")}`);
  }
  return true;
};
