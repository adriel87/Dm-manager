import { Campaign, CampaignI, validateCampaign } from "@/domain/campaign/campaign";
import { describe, expect, it } from "vitest";

describe("Campaign domain", () => {
    const validCampaignData: CampaignI = {
        id: "1",
        name: "The Lost Kingdom",
        description: "An epic adventure across the lost kingdom",
        status: "Activa",
        sessions: 3,
    };

    describe("validateCampaign", () => {
        it("should return true for a valid campaign", () => {
            const result = validateCampaign(validCampaignData);
            expect(result).toBe(true);
        })

        it("should throw when name is missing", () => {
            const invalid = { ...validCampaignData, name: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign name is invalid, almost 3 characters");
        })

        it("should throw when name is null", () => {
            const invalid = { ...validCampaignData, name: null as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign name is invalid, almost 3 characters");
        })

        it("should throw when name is shorter than 3 characters", () => {
            const invalid = { ...validCampaignData, name: "ab" };
            expect(() => validateCampaign(invalid)).toThrow("Campaign name is invalid, almost 3 characters");
        })

        it("should accept name with exactly 3 characters", () => {
            const valid = { ...validCampaignData, name: "abc" };
            const result = validateCampaign(valid);
            expect(result).toBe(true);
        })

        it("should throw when description is missing", () => {
            const invalid = { ...validCampaignData, description: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign description is invalid, almost 3 characters");
        })

        it("should throw when description is null", () => {
            const invalid = { ...validCampaignData, description: null as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign description is invalid, almost 3 characters");
        })

        it("should throw when description is shorter than 3 characters", () => {
            const invalid = { ...validCampaignData, description: "ab" };
            expect(() => validateCampaign(invalid)).toThrow("Campaign description is invalid, almost 3 characters");
        })

        it("should throw when status is invalid", () => {
            const invalid = { ...validCampaignData, status: "Desconocido" as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign status is invalid");
        })

        it("should throw when status is missing", () => {
            const invalid = { ...validCampaignData, status: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("Campaign status is invalid");
        })

        it("should accept status 'Activa'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Activa" });
            expect(result).toBe(true);
        })

        it("should accept status 'Pausada'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Pausada" });
            expect(result).toBe(true);
        })

        it("should accept status 'Finalizada'", () => {
            const result = validateCampaign({ ...validCampaignData, status: "Finalizada" });
            expect(result).toBe(true);
        })

        it("should throw when sessions is negative", () => {
            const invalid = { ...validCampaignData, sessions: -1 };
            expect(() => validateCampaign(invalid)).toThrow("Invalid group Session");
        })

        it("should throw when sessions is missing", () => {
            const invalid = { ...validCampaignData, sessions: undefined as any };
            expect(() => validateCampaign(invalid)).toThrow("Invalid group Session");
        })

        it("should accept sessions equal to 0", () => {
            const result = validateCampaign({ ...validCampaignData, sessions: 0 });
            expect(result).toBe(true);
        })

        it("should accumulate multiple errors and throw all of them", () => {
            const invalid = { ...validCampaignData, name: "ab", description: "x", status: undefined as any, sessions: -1 };
            expect(() => validateCampaign(invalid)).toThrow("Errors in character:");
        })
    })

    describe("Campaign.updateCampaign()", () => {
        it("should update the name when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ name: "New Name" });
            expect(campaign.name).toBe("New Name");
        })

        it("should update the description when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ description: "New description for campaign" });
            expect(campaign.description).toBe("New description for campaign");
        })

        it("should update the status when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ status: "Finalizada" });
            expect(campaign.status).toBe("Finalizada");
        })

        it("should update sessions when provided", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ sessions: 10 });
            expect(campaign.sessions).toBe(10);
        })

        it("should update nextSessionAt when provided", () => {
            const campaign = new Campaign(validCampaignData);
            const nextDate = new Date("2026-05-01");
            campaign.updateCampaign({ nextSessionAt: nextDate });
            expect(campaign.nextSessionAt).toEqual(nextDate);
        })

        it("should update lastSessionAt when provided", () => {
            const campaign = new Campaign(validCampaignData);
            const lastDate = new Date("2026-04-01");
            campaign.updateCampaign({ lastSessionAt: lastDate });
            expect(campaign.lastSessionAt).toEqual(lastDate);
        })

        it("should not change name if not provided in partial update", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ description: "Updated description text" });
            expect(campaign.name).toBe(validCampaignData.name);
        })

        it("should set updatedAt to a Date after calling updateCampaign", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.updatedAt).toBeUndefined();
            campaign.updateCampaign({ name: "Updated" });
            expect(campaign.updatedAt).toBeInstanceOf(Date);
        })

        it("should apply multiple partial updates at once", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ name: "Multi Update", status: "Pausada", sessions: 5 });
            expect(campaign.name).toBe("Multi Update");
            expect(campaign.status).toBe("Pausada");
            expect(campaign.sessions).toBe(5);
        })

        it("should not update name if empty string is provided (falsy guard)", () => {
            const campaign = new Campaign(validCampaignData);
            campaign.updateCampaign({ name: "" });
            expect(campaign.name).toBe(validCampaignData.name);
        })
    })

    describe("Campaign constructor", () => {
        it("should set createdAt to a Date when not provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.createdAt).toBeInstanceOf(Date);
        })

        it("should preserve createdAt when provided", () => {
            const createdAt = new Date("2025-01-01");
            const campaign = new Campaign({ ...validCampaignData, createdAt });
            expect(campaign.createdAt).toEqual(createdAt);
        })

        it("should initialize groups as an empty array", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.groups).toEqual([]);
        })

        it("should set updatedAt as undefined when not provided", () => {
            const campaign = new Campaign(validCampaignData);
            expect(campaign.updatedAt).toBeUndefined();
        })
    })
})
