import { Session } from "./session";

export interface SessionRepository {
  getAllSessions(): Promise<Session[]>;
  getSessionsByCampaign(campaignId: string): Promise<Session[]>;
  getSessionById(id: string): Promise<Session | null>;
  createSession(session: Omit<Session, "id">): Promise<Session>;
  updateSession(session: Session): Promise<Session | null>;
  deleteSession(id: string): Promise<boolean>;
}
