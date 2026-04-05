import {
  assertNotFinalizada,
  GroupSnapshot,
  validateGroupSnapshot,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { GroupRepository } from "@/domain/group/groupRepository";
import type { SpeakerMapping } from "@/domain/recording/recording";

/**
 * assignGroup — Assigns a group to a campaign (replaces existing group).
 *
 * Steps:
 * 1. Fetch full group from GroupRepository
 * 2. Fetch campaign
 * 3. Assert campaign is not finalized
 * 4. Build GroupSnapshot from full group (includes speakerId/playerAlias)
 * 5. Validate GroupSnapshot
 * 6. Call campaignRepo.assignGroup
 * 7. Auto-populate discordSpeakerMappings from group members (additive)
 */
export const assignGroup = async (
  campaignRepository: CampaignRepository,
  groupRepository: GroupRepository,
  campaignId: string,
  groupId: string,
  dmDiscordUserId?: string,
  dmDiscordUsername?: string,
): Promise<GroupSnapshot> => {
  try {
    // Step 1: Fetch full group
    const group = await groupRepository.getGroupById(groupId);
    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    // Step 2: Fetch campaign
    const campaign = await campaignRepository.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaña no encontrada");
    }

    // Step 3: Assert not finalized
    assertNotFinalizada(campaign);

    // Step 4: Build GroupSnapshot (include speakerId/playerAlias for speaker mapping)
    const groupSnapshot: GroupSnapshot = {
      id: group.id,
      name: group.name,
      members: group.members.map(m => ({
        id: m.id,
        name: m.name,
        classType: m.classType,
        speakerId: m.speakerId,
        playerAlias: m.playerAlias,
      })),
      description: group.description,
      snapshotAt: new Date(),
    };

    // Step 5: Validate GroupSnapshot
    validateGroupSnapshot(groupSnapshot);

    // Step 6: Assign to campaign (replaces existing group)
    const updatedCampaign = await campaignRepository.assignGroup(campaignId, groupSnapshot);
    if (!updatedCampaign) {
      throw new Error("Error al asignar grupo a la campaña");
    }

    // Step 7: Auto-populate speaker mappings (additive — never overwrites existing)
    const existingMappings: SpeakerMapping[] = updatedCampaign.discordSpeakerMappings ?? [];
    const existingIds = new Set(existingMappings.map((m) => m.discordUserId));
    const toAdd: SpeakerMapping[] = [];

    for (const member of groupSnapshot.members) {
      if (!member.speakerId || existingIds.has(member.speakerId)) continue;
      const displayName = member.playerAlias ?? member.name;
      toAdd.push({
        discordUserId: member.speakerId,
        discordUsername: displayName,
        characterId: member.id,
        characterName: member.name,
        label: displayName,
        role: "player",
      });
      existingIds.add(member.speakerId);
    }

    const dmId = dmDiscordUserId?.trim();
    if (dmId && !existingIds.has(dmId)) {
      const dmName = dmDiscordUsername?.trim() || "DM";
      toAdd.push({
        discordUserId: dmId,
        discordUsername: dmName,
        characterId: null,
        characterName: null,
        label: dmName,
        role: "dm",
      });
    }

    if (toAdd.length > 0) {
      await campaignRepository.setSpeakerMappings(campaignId, [
        ...existingMappings,
        ...toAdd,
      ]);
    }

    return groupSnapshot;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
