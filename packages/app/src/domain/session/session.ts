export interface Session {
  id: string;
  campaignId: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: Date;
}

export const validateSession = (session: Partial<Session>): boolean => {
  if (!session.campaignId || session.campaignId.trim() === "") {
    throw new Error("Session campaignId is required");
  }
  if (!session.title || session.title.trim() === "") {
    throw new Error("Session title is required");
  }
  if (!session.sessionNumber || session.sessionNumber < 1) {
    throw new Error("Session number must be a positive number");
  }
  return true;
};
