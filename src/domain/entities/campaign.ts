export interface Campaign
{
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CampaignStatus {
  Activa = 'Activa',
  Pausada = 'Pausada',
  Finalizada = 'Finalizada',
}

export type CampaignStatusType = keyof typeof CampaignStatus;

export class CampaignEntity implements Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(campaign: Campaign) {
    this.id = campaign.id;
    this.name = campaign.name;
    this.description = campaign.description;
    this.status = campaign.status;
    this.createdAt = campaign.createdAt || new Date();
    this.updatedAt = campaign.updatedAt || new Date();
  }
}