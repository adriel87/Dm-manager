import { campaignMemoryRepository } from "@/infrastructure/adapters/repositories/memory/campaign.repository";
import { characterMemoryRepository } from "@/infrastructure/adapters/repositories/memory/character.repository";
import { groupMemoryRepository } from "@/infrastructure/adapters/repositories/memory/group.repository";
import { dashboardMemoryRepository } from "@/infrastructure/adapters/repositories/memory/dashboard.repository";
import { campaignRepository } from "@/infrastructure/adapters/repositories/mongo/campaign.repository";
import { characterRepository } from "@/infrastructure/adapters/repositories/mongo/character.repository";
import { groupRepository } from "@/infrastructure/adapters/repositories/mongo/group.repository";
import { dashboardRepository } from "@/infrastructure/adapters/repositories/mongo/dashboard.repository";

const useMemory = process.env.REPOSITORY_TYPE === "memory";

export const repositories = {
  campaign: useMemory ? campaignMemoryRepository : campaignRepository,
  character: useMemory ? characterMemoryRepository : characterRepository,
  group: useMemory ? groupMemoryRepository : groupRepository,
  dashboard: useMemory ? dashboardMemoryRepository : dashboardRepository,
  // mission and session removed - now managed as embedded collections in Campaign aggregate
};
