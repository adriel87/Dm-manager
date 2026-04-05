import {
  assertNotFinalizada,
  GroupSnapshot,
  validateGroupSnapshot,
} from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import { GroupRepository } from "@/domain/group/groupRepository";

/**
 * assignGroup — Assigns a group to a campaign (replaces existing group).
 * 
 * Steps:
 * 1. Fetch full group from GroupRepository
 * 2. Fetch campaign
 * 3. Assert campaign is not finalized
 * 4. Build GroupSnapshot from full group
 * 5. Validate GroupSnapshot
 * 6. Call campaignRepo.assignGroup
 */
export const assignGroup = async (
  campaignRepository: CampaignRepository,
  groupRepository: GroupRepository,
  campaignId: string,
  groupId: string
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

    // Step 4: Build GroupSnapshot
    const groupSnapshot: GroupSnapshot = {
      id: group.id,
      name: group.name,
      members: group.members.map(m => ({
        id: m.id,
        name: m.name,
        classType: m.classType,
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

    return groupSnapshot;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
