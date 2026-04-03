import {
  CampaignI,
  CharacterRef,
  EmbeddedItem,
  EmbeddedMission,
  EmbeddedSession,
  GroupSnapshot,
} from "./campaign";

/**
 * CampaignRepository — Port for Campaign aggregate persistence.
 * Supports CRUD on root entity plus sub-document operations for embedded collections.
 */
export interface CampaignRepository {
  // ========================================
  // Root Entity Operations
  // ========================================
  getAllCampaigns(): Promise<CampaignI[]>;
  getCampaignById(id: string): Promise<CampaignI | null>;
  createCampaign(campaign: Omit<CampaignI, "id">): Promise<CampaignI>;
  updateCampaign(campaign: CampaignI): Promise<CampaignI | null>;
  deleteCampaign(id: string): Promise<boolean>;

  // ========================================
  // Mission Sub-Document Operations
  // ========================================
  /**
   * addMission — Adds a new mission to the campaign's missions array.
   * Returns the updated campaign, or null if campaign not found.
   */
  addMission(
    campaignId: string,
    mission: EmbeddedMission,
  ): Promise<CampaignI | null>;

  /**
   * updateMission — Updates an existing mission within the campaign.
   * Matches by mission.id within the missions array.
   * Returns the updated campaign, or null if campaign/mission not found.
   */
  updateMission(
    campaignId: string,
    mission: EmbeddedMission,
  ): Promise<CampaignI | null>;

  /**
   * removeMission — Removes a mission from the campaign's missions array.
   * Returns the updated campaign, or null if campaign not found.
   */
  removeMission(
    campaignId: string,
    missionId: string,
  ): Promise<CampaignI | null>;

  // ========================================
  // Session Sub-Document Operations
  // ========================================
  /**
   * addSession — Adds a new session to the campaign's sessions array.
   * Returns the updated campaign, or null if campaign not found.
   */
  addSession(
    campaignId: string,
    session: EmbeddedSession,
  ): Promise<CampaignI | null>;

  /**
   * updateSession — Updates an existing session within the campaign.
   * Matches by session.id within the sessions array.
   * Returns the updated campaign, or null if campaign/session not found.
   */
  updateSession(
    campaignId: string,
    session: EmbeddedSession,
  ): Promise<CampaignI | null>;

  /**
   * removeSession — Removes a session from the campaign's sessions array.
   * Returns the updated campaign, or null if campaign not found.
   */
  removeSession(
    campaignId: string,
    sessionId: string,
  ): Promise<CampaignI | null>;

  // ========================================
  // Character Sub-Document Operations
  // ========================================
  /**
   * addCharacter — Adds a character reference to the campaign's characters array.
   * Returns the updated campaign, or null if campaign not found.
   */
  addCharacter(
    campaignId: string,
    character: CharacterRef,
  ): Promise<CampaignI | null>;

  /**
   * removeCharacter — Removes a character reference from the campaign's characters array.
   * Returns the updated campaign, or null if campaign not found.
   */
  removeCharacter(
    campaignId: string,
    characterId: string,
  ): Promise<CampaignI | null>;

  // ========================================
  // Group Sub-Document Operations
  // ========================================
  /**
   * assignGroup — Assigns a group snapshot to the campaign (replaces existing group).
   * Returns the updated campaign, or null if campaign not found.
   */
  assignGroup(
    campaignId: string,
    group: GroupSnapshot,
  ): Promise<CampaignI | null>;

  /**
   * removeGroup — Removes the group snapshot from the campaign (sets to null).
   * Returns the updated campaign, or null if campaign not found.
   */
  removeGroup(campaignId: string): Promise<CampaignI | null>;

  // ========================================
  // Inventory Sub-Document Operations
  // ========================================
  /**
   * addInventoryItem — Adds an item to the campaign's inventory.items array.
   * Returns the updated campaign, or null if campaign not found.
   */
  addInventoryItem(campaignId: string, item: EmbeddedItem): Promise<CampaignI | null>;

  /**
   * updateInventoryItem — Updates an existing item within inventory.items.
   * Matches by item.id. Returns the updated campaign, or null if not found.
   */
  updateInventoryItem(campaignId: string, item: EmbeddedItem): Promise<CampaignI | null>;

  /**
   * removeInventoryItem — Removes an item from inventory.items by id.
   * Returns the updated campaign, or null if campaign not found.
   */
  removeInventoryItem(campaignId: string, itemId: string): Promise<CampaignI | null>;

  /**
   * incrementInventoryMoney — Increments (or decrements if negative) the inventory money field atomically.
   * Returns the updated campaign, or null if campaign not found.
   */
  incrementInventoryMoney(campaignId: string, delta: number): Promise<CampaignI | null>;
}
