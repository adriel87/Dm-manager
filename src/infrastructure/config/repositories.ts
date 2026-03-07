import { campaignMemoryRepository } from "@/infrastructure/adapters/repositories/memory/campaign.repository";
import { characterMemoryRepository } from "@/infrastructure/adapters/repositories/memory/character.repository";
import { groupMemoryRepository } from "@/infrastructure/adapters/repositories/memory/group.repository";
import { missionMemoryRepository } from "@/infrastructure/adapters/repositories/memory/mission.repository";
import { sessionMemoryRepository } from "@/infrastructure/adapters/repositories/memory/session.repository";
import { campaignRepository } from "@/infrastructure/adapters/repositories/mongo/campaign.repository";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { groupRepository } from "@/infrastructure/adapters/repositories/mongo/group.repository";
import { missionRepository } from "@/infrastructure/adapters/repositories/mongo/mission.repository";
import { sessionRepository } from "@/infrastructure/adapters/repositories/mongo/session.repository";

const useMemory = process.env.REPOSITORY_TYPE === "memory";

export const repositories = {
  campaign: useMemory ? campaignMemoryRepository : campaignRepository,
  character: useMemory ? characterMemoryRepository : characterRepository,
  group: useMemory ? groupMemoryRepository : groupRepository,
  mission: useMemory ? missionMemoryRepository : missionRepository,
  session: useMemory ? sessionMemoryRepository : sessionRepository,
};
