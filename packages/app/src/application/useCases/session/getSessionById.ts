import { Session } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";

export const getSessionById = async (
  repository: SessionRepository,
  id: string
): Promise<Session | null> => {
  if (!id) throw new Error("Invalid id");
  return repository.getSessionById(id);
};
