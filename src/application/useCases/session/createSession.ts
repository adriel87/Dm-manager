import { Session, validateSession } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";

export const createSession = async (
  repository: SessionRepository,
  session: Omit<Session, "id">
): Promise<Session> => {
  validateSession(session);
  return repository.createSession(session);
};
