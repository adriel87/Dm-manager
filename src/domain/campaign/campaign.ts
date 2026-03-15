
// ========================================
// Embedded Sub-Entity Types (Aggregate Components)
// ========================================

/** Inline event type for embedded missions — avoids cross-domain import */
export type TypeEvent = {
  name: string;
  difficult: string;
};

/** Inline mission status — avoids cross-domain import */
export type MissionStatusType = "Activa" | "Pausada" | "Finalizada";

/** Inline character class type — avoids cross-domain import */
export type DnDClassType = 
  | "Barbarian"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Fighter"
  | "Monk"
  | "Paladin"
  | "Ranger"
  | "Rogue"
  | "Sorcerer"
  | "Warlock"
  | "Wizard"
  | "Artificer"
  | "Blood Hunter"
  | "Normal"
  | "Other";

/**
 * EmbeddedMission — Mission embedded within Campaign aggregate.
 * ID is generated via crypto.randomUUID() at creation.
 */
export interface EmbeddedMission {
  id: string; // crypto.randomUUID()
  name: string;
  description: string;
  missionGuide: string;
  missionEvents: TypeEvent[] | null;
  missionPriority: string;
  rewards: string | null;
  relatedCharacters: Pick<Character, "id" | "name">[] | null;
  startDate?: Date;
  endDate?: Date;
  status: MissionStatusType;
}

/**
 * EmbeddedSession — Session embedded within Campaign aggregate.
 * ID is generated via crypto.randomUUID() at creation.
 */
export interface EmbeddedSession {
  id: string; // crypto.randomUUID()
  title: string;
  notes: string;
  sessionNumber: number;
  date: Date;
}

/**
 * CharacterRef — Lightweight reference to a Character entity.
 * Denormalized snapshot for quick access without joins.
 */
export interface CharacterRef {
  id: string;
  name: string;
  classType: DnDClassType;
  level: number;
}

/**
 * GroupSnapshot — Denormalized snapshot of a Group at assignment time.
 * Captures group state to preserve history even if group is later modified.
 */
export interface GroupSnapshot {
  id: string;
  name: string;
  members: Pick<Character, "id" | "name" | "classType">[];
  description: string;
  snapshotAt: Date;
}

// Temporary type to satisfy TypeScript — will be replaced when we inline Character interface
type Character = {
  id: string;
  name: string;
  classType: DnDClassType;
};

// ========================================
// Campaign Aggregate Root
// ========================================

export interface CampaignI {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  
  // Aggregate collections (embedded sub-entities)
  missions: EmbeddedMission[];
  sessions: EmbeddedSession[];
  characters: CharacterRef[];
  group: GroupSnapshot | null;
  
  // Metadata
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
  
  // Aggregate collections
  missions: EmbeddedMission[];
  sessions: EmbeddedSession[];
  characters: CharacterRef[];
  group: GroupSnapshot | null;
  
  // Metadata
  nextSessionAt?: Date | undefined;
  lastSessionAt?: Date | undefined;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(campaign: CampaignI) {
    this.id = campaign.id;
    this.name = campaign.name;
    this.description = campaign.description;
    this.status = campaign.status;
    
    // Initialize aggregate collections
    this.missions = campaign.missions ?? [];
    this.sessions = campaign.sessions ?? [];
    this.characters = campaign.characters ?? [];
    this.group = campaign.group ?? null;
    
    this.nextSessionAt = campaign.nextSessionAt ?? undefined;
    this.lastSessionAt = campaign.lastSessionAt ?? undefined;
    this.createdAt = campaign.createdAt || new Date();
    this.updatedAt = campaign.updatedAt;
  }

  /**
   * updateCampaign — Updates ONLY root-level fields.
   * Sub-collections (missions, sessions, characters, group) are managed
   * via repository methods (addMission, removeSession, etc.).
   */
  updateCampaign(partialCampaign: Partial<CampaignI>) {
    if (partialCampaign.name) this.name = partialCampaign.name;
    if (partialCampaign.status) this.status = partialCampaign.status;
    if (partialCampaign.description)
      this.description = partialCampaign.description;
    if (partialCampaign.nextSessionAt)
      this.nextSessionAt = partialCampaign.nextSessionAt;
    if (partialCampaign.lastSessionAt)
      this.lastSessionAt = partialCampaign.lastSessionAt;

    this.updatedAt = new Date();
  }
}

// ========================================
// Validation Functions
// ========================================

/**
 * validateCampaign — Validates root-level campaign fields.
 * Note: sessions field removed (now an embedded collection).
 */
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
  if (errors.length > 0) {
    throw new Error(`Errores en la campaña:\n${errors.join("\n")}`);
  }
  return true;
};

/**
 * validateEmbeddedMission — Validates an embedded mission.
 * Throws on validation failure.
 */
export const validateEmbeddedMission = (
  mission: Partial<EmbeddedMission>,
): boolean => {
  const errors: Array<string> = [];
  if (!mission.name || mission.name.trim().length < 3) {
    errors.push("El nombre de la misión no es válido, mínimo 3 caracteres");
  }
  if (!mission.description || mission.description.trim().length < 3) {
    errors.push(
      "La descripción de la misión no es válida, mínimo 3 caracteres",
    );
  }
  if (!mission.missionGuide || mission.missionGuide.trim().length < 3) {
    errors.push("La guía de la misión no es válida, mínimo 3 caracteres");
  }
  if (!mission.missionPriority || mission.missionPriority.trim() === "") {
    errors.push("La prioridad de la misión es requerida");
  }
  if(mission?.status?.length === 0) {
     errors.push("El estado de la misión no es válido");
  }
  if (
    mission.status &&
    !["Activa", "Pausada", "Finalizada"].includes(mission.status)
  ) {
    errors.push("El estado de la misión no es válido");
  }
  if (errors.length > 0) {
    throw new Error(`Errores en la misión:\n${errors.join("\n")}`);
  }
  return true;
};

/**
 * validateEmbeddedSession — Validates an embedded session.
 * Throws on validation failure.
 */
export const validateEmbeddedSession = (
  session: Partial<EmbeddedSession>,
): boolean => {
  const errors: Array<string> = [];
  if (!session.title || session.title.trim().length < 3) {
    errors.push("El título de la sesión no es válido, mínimo 3 caracteres");
  }
  if (!session.notes || session.notes.trim().length < 3) {
    errors.push("Las notas de la sesión no son válidas, mínimo 3 caracteres");
  }
  if (
    session.sessionNumber === null ||
    session.sessionNumber === undefined ||
    session.sessionNumber < 1
  ) {
    errors.push("El número de sesión debe ser mayor o igual a 1");
  }
  if (!session.date || !(session.date instanceof Date)) {
    errors.push("La fecha de la sesión es requerida");
  }
  if (errors.length > 0) {
    throw new Error(`Errores en la sesión:\n${errors.join("\n")}`);
  }
  return true;
};

/**
 * validateCharacterRef — Validates a character reference.
 * Throws on validation failure.
 */
export const validateCharacterRef = (
  ref: Partial<CharacterRef>,
): boolean => {
  const errors: Array<string> = [];
  if (!ref.id || ref.id.trim() === "") {
    errors.push("El ID del personaje es requerido");
  }
  if (!ref.name || ref.name.trim().length < 2) {
    errors.push("El nombre del personaje no es válido, mínimo 2 caracteres");
  }
  if (!ref.classType || ref.classType.trim() === "") {
    errors.push("La clase del personaje es requerida");
  }
  if (
    ref.level === null ||
    ref.level === undefined ||
    ref.level < 1 
  ) {
    errors.push("El nivel del personaje debe ser 1 o mayor");
  }
  if (errors.length > 0) {
    throw new Error(
      `Errores en la referencia del personaje:\n${errors.join("\n")}`,
    );
  }
  return true;
};

/**
 * validateGroupSnapshot — Validates a group snapshot.
 * Throws on validation failure.
 */
export const validateGroupSnapshot = (
  group: Partial<GroupSnapshot>,
): boolean => {
  const errors: Array<string> = [];
  if (!group.id || group.id.trim() === "") {
    errors.push("El ID del grupo es requerido");
  }
  if (!group.name || group.name.trim().length < 3) {
    errors.push("El nombre del grupo no es válido, mínimo 3 caracteres");
  }
  if (!group.description || group.description.trim().length < 3) {
    errors.push(
      "La descripción del grupo no es válida, mínimo 3 caracteres",
    );
  }
  if (!group.members || !Array.isArray(group.members)) {
    errors.push("Los miembros del grupo son requeridos");
  }
  if (!group.snapshotAt || !(group.snapshotAt instanceof Date)) {
    errors.push("La fecha de snapshot es requerida");
  }
  if (errors.length > 0) {
    throw new Error(`Errores en el snapshot del grupo:\n${errors.join("\n")}`);
  }
  return true;
};

/**
 * assertNotFinalizada — Throws if campaign status is 'Finalizada'.
 * Used to prevent mutations on completed campaigns.
 */
export const assertNotFinalizada = (campaign: CampaignI): void => {
  if (campaign.status === "Finalizada") {
    throw new Error(
      "No se pueden realizar cambios en una campaña finalizada",
    );
  }
};

/**
 * assertUniqueMissionName — Throws if a mission with the same name already exists.
 * Used to enforce unique mission names within a campaign.
 * 
 * @param missions - Current missions in the campaign
 * @param name - Name to check
 * @param excludeId - Optional mission ID to exclude from check (for updates)
 */
export const assertUniqueMissionName = (
  missions: EmbeddedMission[],
  name: string,
  excludeId?: string,
): void => {
  const duplicate = missions.find(
    (m) => m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId,
  );
  if (duplicate) {
    throw new Error(
      `Ya existe una misión con el nombre "${name}" en esta campaña`,
    );
  }
};
