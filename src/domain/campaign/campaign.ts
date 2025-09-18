export interface CampaignI
{
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  sessions: number
  nextSessionAt?: Date;
  lastSessionAt?: Date
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CampaignStatus {
  Activa = 'Activa',
  Pausada = 'Pausada',
  Finalizada = 'Finalizada',
}

export type CampaignStatusType = keyof typeof CampaignStatus;



export class Campaign implements CampaignI {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  sessions: number
  nextSessionAt?: Date | undefined;
  lastSessionAt?: Date | undefined;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(campaign: CampaignI) {
    this.id = campaign.id;
    this.name = campaign.name;
    this.description = campaign.description;
    this.status = campaign.status;
    this.sessions = campaign.sessions
    this.nextSessionAt = campaign.nextSessionAt ?? undefined
    this.lastSessionAt = campaign.lastSessionAt ?? undefined
    this.createdAt = campaign.createdAt || new Date();
    this.updatedAt = campaign.updatedAt
  }

  updateCampaign(partialCampaign: Partial<CampaignI>){
    if(partialCampaign.name) this.name = partialCampaign.name
    if(partialCampaign.status) this.status = partialCampaign.status
    if(partialCampaign.description) this.description = partialCampaign.description
    if(partialCampaign.name) this.name = partialCampaign.name
    if(partialCampaign.nextSessionAt) this.nextSessionAt = partialCampaign.nextSessionAt
    if(partialCampaign.lastSessionAt) this.lastSessionAt = partialCampaign.lastSessionAt
    if(partialCampaign.sessions) this.sessions = partialCampaign.sessions
    
    this.updatedAt = new Date()
  }

}

  export const validateCampaign = (partialCampaign: Partial<CampaignI>)=>{
    const errors : Array<string> = []
    if(
      partialCampaign.name === null || 
      partialCampaign.name === undefined ||
      partialCampaign.name.length < 3
    ){
      errors.push("Campaign name is invalid, almost 3 characters")
    } 
    if(
      partialCampaign.status === null ||
      partialCampaign.status === undefined ||
      !(partialCampaign.status in CampaignStatus)
    ) {
      errors.push("Campaign status is invalid")
    }
    if( partialCampaign.description === null || 
      partialCampaign.description === undefined ||
      partialCampaign.description.length < 3) {
        errors.push("Campaign description is invalid, almost 3 characters")
      }
    if( 
      partialCampaign.sessions === null || 
      partialCampaign.sessions === undefined ||
      partialCampaign.sessions < 0
    ) {
        errors.push("Invalid group Session")
      }
    if (errors.length > 0) {
      throw new Error(`Errors in character: \n${errors.join('\n')}`)
    }
    return true
  }