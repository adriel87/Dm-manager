import type { APIRequestContext } from '@playwright/test';

const BASE = 'http://localhost:3000';

export async function createCampaign(
  request: APIRequestContext,
  name = 'E2E Test Campaign'
) {
  const res = await request.post(`${BASE}/api/campaign`, {
    data: { name, description: 'Created by E2E test', status: 'Activa', sessions: 0 },
  });
  const body = await res.json();
  return body as { id: string; name: string };
}

export async function deleteCampaign(request: APIRequestContext, id: string) {
  await request.delete(`${BASE}/api/campaign/${id}`);
}

export async function createCharacter(
  request: APIRequestContext,
  overrides: Partial<{
    name: string;
    classType: string;
    level: number;
    hitPoints: number;
    age: string;
    isNPC: boolean;
  }> = {}
) {
  const res = await request.post(`${BASE}/api/character`, {
    data: {
      name: 'E2E Character',
      classType: 'Fighter',
      level: 1,
      hitPoints: 10,
      age: 'adult',
      isNPC: false,
      ...overrides,
    },
  });
  const body = await res.json();
  return body as { id: string; name: string };
}

export async function deleteCharacter(request: APIRequestContext, id: string) {
  await request.delete(`${BASE}/api/character/${id}`);
}

export async function createSession(
  request: APIRequestContext,
  campaignId: string
) {
  const res = await request.post(`${BASE}/api/session`, {
    data: {
      campaignId,
      title: 'E2E Session',
      notes: 'Notes for E2E session',
      sessionNumber: 1,
      date: '2025-01-01',
    },
  });
  const body = await res.json();
  return body as { id: string };
}

export async function deleteSession(request: APIRequestContext, id: string) {
  await request.delete(`${BASE}/api/session/${id}`);
}

export async function createMission(request: APIRequestContext) {
  const res = await request.post(`${BASE}/api/mission`, {
    data: {
      name: 'E2E Mission',
      description: 'Description for E2E mission test',
      missionGuide: 'Guide for E2E mission',
      missionPriority: 'Media',
      status: 'Activa',
      missionEvents: null,
      rewards: null,
      relatedCharacters: null,
    },
  });
  const body = await res.json();
  return body as { id: string };
}

export async function deleteMission(request: APIRequestContext, id: string) {
  await request.delete(`${BASE}/api/mission/${id}`);
}
