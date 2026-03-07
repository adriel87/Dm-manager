import { createSession, deleteSession, getSessionById, updateSession } from "@/application/useCases/session";
import { Session } from "@/domain/session/session";
import { SessionRepository } from "@/domain/session/sessionRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSessionRepository: SessionRepository = {
  getAllSessions: vi.fn(),
  getSessionsByCampaign: vi.fn(),
  getSessionById: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
};

const validSession: Session = {
  id: "1",
  campaignId: "campaign-1",
  title: "The Dark Forest",
  notes: "Players found the ancient map.",
  sessionNumber: 1,
  date: new Date("2024-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  it("should create a session successfully", async () => {
    const { id, ...input } = validSession;
    vi.mocked(mockSessionRepository.createSession).mockResolvedValue(validSession);

    const result = await createSession(mockSessionRepository, input);

    expect(result).toEqual(validSession);
    expect(mockSessionRepository.createSession).toHaveBeenCalledOnce();
  });

  it("should throw when title is missing", () => {
    const { id, ...input } = validSession;
    const result = createSession(mockSessionRepository, { ...input, title: "" });
    expect(result).rejects.toThrow("Session title is required");
  });

  it("should throw when campaignId is missing", () => {
    const { id, ...input } = validSession;
    const result = createSession(mockSessionRepository, { ...input, campaignId: "" });
    expect(result).rejects.toThrow("Session campaignId is required");
  });
});

describe("getSessionById", () => {
  it("should return a session by id", async () => {
    vi.mocked(mockSessionRepository.getSessionById).mockResolvedValue(validSession);

    const result = await getSessionById(mockSessionRepository, "1");

    expect(result).toEqual(validSession);
    expect(mockSessionRepository.getSessionById).toHaveBeenCalledWith("1");
  });

  it("should return null when session does not exist", async () => {
    vi.mocked(mockSessionRepository.getSessionById).mockResolvedValue(null);

    const result = await getSessionById(mockSessionRepository, "non-existent");

    expect(result).toBeNull();
  });

  it("should throw when id is invalid", () => {
    const result = getSessionById(mockSessionRepository, null as any);
    expect(result).rejects.toThrow("Invalid id");
  });
});

describe("updateSession", () => {
  it("should update a session successfully", async () => {
    vi.mocked(mockSessionRepository.getSessionById).mockResolvedValue(validSession);
    vi.mocked(mockSessionRepository.updateSession).mockResolvedValue({ ...validSession, title: "Updated Title" });

    const result = await updateSession(mockSessionRepository, { id: "1", title: "Updated Title" });

    expect(result?.title).toBe("Updated Title");
    expect(mockSessionRepository.updateSession).toHaveBeenCalledOnce();
  });

  it("should throw when session does not exist", () => {
    vi.mocked(mockSessionRepository.getSessionById).mockResolvedValue(null);

    const result = updateSession(mockSessionRepository, { id: "non-existent", title: "x" });
    expect(result).rejects.toThrow("Session not found");
  });
});

describe("deleteSession", () => {
  it("should delete a session successfully", async () => {
    vi.mocked(mockSessionRepository.deleteSession).mockResolvedValue(true);

    const result = await deleteSession(mockSessionRepository, "1");

    expect(result).toBe(true);
    expect(mockSessionRepository.deleteSession).toHaveBeenCalledWith("1");
  });

  it("should throw when id is invalid", () => {
    const result = deleteSession(mockSessionRepository, null as any);
    expect(result).rejects.toThrow("Invalid id");
  });

  it("should throw when delete fails", () => {
    vi.mocked(mockSessionRepository.deleteSession).mockResolvedValue(false);
    const result = deleteSession(mockSessionRepository, "1");
    expect(result).rejects.toThrow("Failed to delete session");
  });
});
