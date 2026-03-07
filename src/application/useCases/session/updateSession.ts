import { Session, validateSession } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";

export const updateSession = async (
  repository: SessionRepository,
  session: Partial<Session> & { id: string }
): Promise<Session | null> => {
  const existing = await repository.getSessionById(session.id);
  if (!existing) throw new Error("Session not found");

  const updated: Session = { ...existing, ...session };
  validateSession(updated);

  return repository.updateSession(updated);
};
