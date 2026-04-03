/**
 * dm-manager.client.ts
 *
 * Typed HTTP client for the DM Manager API.
 *
 * All bot ↔ DM Manager communication goes through this module.
 * Never call fetch() directly from command handlers — always use this client.
 *
 * Responsibilities:
 * - Build correct URLs from DM_MANAGER_URL env variable
 * - Apply request timeouts
 * - Throw descriptive errors on non-2xx responses
 * - Provide typed request/response interfaces
 */

import type {
  StartRecordingInput,
  StartRecordingResponse,
  StopRecordingInput,
  StopRecordingResponse,
  TranscribeRecordingInput,
  TranscribeRecordingResponse,
  GetRecordingsResponse,
  GetCampaignsResponse,
} from "../types/dm-manager.js";

// ============================================================
// Config
// ============================================================

function getBaseUrl(): string {
  const url = process.env.DM_MANAGER_URL;
  if (!url) {
    throw new Error(
      "DM_MANAGER_URL is not set. Add it to your .env file (e.g. http://localhost:3000)"
    );
  }
  return url.replace(/\/$/, ""); // strip trailing slash
}

const DEFAULT_TIMEOUT_MS = 5_000;
const STOP_TIMEOUT_MS = parseInt(process.env.DM_MANAGER_TIMEOUT_MS ?? "30000", 10);

// ============================================================
// Internal helpers
// ============================================================

async function request<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { ...fetchOptions, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`DM Manager request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw new Error(`DM Manager request failed: ${String(err)}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json() as { error?: string };
      detail = body.error ?? "";
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `DM Manager API error ${response.status} at ${url}${detail ? `: ${detail}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

function json(body: unknown): RequestInit {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Starts a new recording for a campaign session.
 * Called when the DM runs /dm-record start.
 *
 * POST /api/campaign/[id]/recordings
 */
export async function startRecording(
  campaignId: string,
  input: StartRecordingInput
): Promise<StartRecordingResponse> {
  const url = `${getBaseUrl()}/api/campaign/${campaignId}/recordings`;
  return request<StartRecordingResponse>(url, {
    method: "POST",
    ...json(input),
  });
}

/**
 * Stops an active recording and uploads per-speaker audio.
 * Called when the DM runs /dm-record stop.
 *
 * Uses a longer timeout (30s default) because audio buffers can be large.
 *
 * PUT /api/campaign/[id]/recordings/[recordingId]/stop
 */
export async function stopRecording(
  campaignId: string,
  recordingId: string,
  input: StopRecordingInput
): Promise<StopRecordingResponse> {
  const url = `${getBaseUrl()}/api/campaign/${campaignId}/recordings/${recordingId}/stop`;
  return request<StopRecordingResponse>(url, {
    method: "PUT",
    ...json(input),
    timeoutMs: STOP_TIMEOUT_MS,
  });
}

/**
 * Triggers transcription of a stopped recording.
 * Called when the DM runs /dm-record transcribe.
 *
 * POST /api/campaign/[id]/recordings/[recordingId]/transcribe
 */
export async function transcribeRecording(
  campaignId: string,
  recordingId: string,
  input: TranscribeRecordingInput = {}
): Promise<TranscribeRecordingResponse> {
  const url = `${getBaseUrl()}/api/campaign/${campaignId}/recordings/${recordingId}/transcribe`;
  return request<TranscribeRecordingResponse>(url, {
    method: "POST",
    ...json(input),
  });
}

/**
 * Fetches all recordings for a campaign, optionally filtered by session.
 * Used by /dm-record status to show recent recording info.
 *
 * GET /api/campaign/[id]/recordings?sessionId=...
 */
export async function getRecordings(
  campaignId: string,
  sessionId?: string
): Promise<GetRecordingsResponse> {
  const base = `${getBaseUrl()}/api/campaign/${campaignId}/recordings`;
  const url = sessionId ? `${base}?sessionId=${sessionId}` : base;
  return request<GetRecordingsResponse>(url, { method: "GET" });
}

/**
 * Fetches all campaigns.
 * Used for slash command autocomplete so DMs can pick from a list.
 *
 * GET /api/campaign
 */
export async function getCampaigns(): Promise<GetCampaignsResponse> {
  const url = `${getBaseUrl()}/api/campaign`;
  return request<GetCampaignsResponse>(url, { method: "GET" });
}
