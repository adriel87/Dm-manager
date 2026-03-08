import { SessionRepository } from "@/domain/session/sessionRepository";

export const deleteSession = async (
  repository: SessionRepository,
  id: string
): Promise<boolean> => {
  if (!id) throw new Error("Invalid id");
  const deleted = await repository.deleteSession(id);
  if (!deleted) throw new Error("Failed to delete session");
  return deleted;
};
