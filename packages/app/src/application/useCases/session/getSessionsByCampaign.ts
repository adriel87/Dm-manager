import { Session } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";

export const getSessionsByCampaign = async (
  repository: SessionRepository,
  campaignId: string
): Promise<Session[]> => {
  if (!campaignId) throw new Error("Invalid campaignId");
  return repository.getSessionsByCampaign(campaignId);
};
