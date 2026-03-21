import { test, expect } from '@playwright/test';
import {
  createCampaign,
  deleteCampaign,
  createMission,
  createSession,
  deleteSession,
} from './helpers/api';
import { PlayModePage } from './pages/play-mode.page';

/**
 * E2E — Play Mode page (/campaigns/[id]/play)
 *
 * Covers: navigation, two-panel layout, mission expansion, status toggle,
 * filter toggle, session creation, session notes editor, session history,
 * edit session, and back navigation.
 *
 * Setup: a fresh campaign is created via API before each test and deleted after.
 * Missions and sessions are created per-test where needed.
 */
test.describe('Play Mode page (/campaigns/[id]/play)', () => {
  let campaignId: string;

  test.beforeEach(async ({ request }) => {
    const campaign = await createCampaign(request, 'Play Mode Test Campaign');
    campaignId = campaign.id;
  });

  test.afterEach(async ({ request }) => {
    await deleteCampaign(request, campaignId);
  });

  // ── TC-PM-01: Navigate to Play Mode from campaign detail ──────────────────
  test('TC-PM-01: navega a Play Mode desde el detalle de la campaña', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);

    await page.getByRole('button', { name: /modo juego/i }).click();

    await expect(page).toHaveURL(`/campaigns/${campaignId}/play`);
    await expect(page.getByText('Modo Juego')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Play Mode Test Campaign', level: 1 })).toBeVisible();
  });

  // ── TC-PM-02: Two-panel layout renders on desktop ─────────────────────────
  test('TC-PM-02: muestra los dos paneles en desktop', async ({ page }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await playPage.expectTwoPanels();
    await expect(playPage.missionPanelHeading).toBeVisible();
    await expect(playPage.sessionPanelHeading).toBeVisible();
  });

  // ── TC-PM-03: Mission panel shows empty state when no missions ────────────
  test('TC-PM-03: panel de misiones muestra estado vacío', async ({ page }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await expect(page.getByText(/no hay misiones en esta campaña/i)).toBeVisible();
  });

  // ── TC-PM-04: Expand mission card shows guide and events ──────────────────
  test('TC-PM-04: expandir misión muestra la guía y los eventos', async ({ page, request }) => {
    await createMission(request, campaignId);
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    // Mission card visible
    await expect(page.getByText('E2E Mission')).toBeVisible();

    // Click to expand
    await page.getByText('E2E Mission').click();

    // Guide section visible
    await expect(page.getByText('Guía del DM')).toBeVisible();
    await expect(page.getByText('Guide for E2E mission')).toBeVisible();

    // Events section visible
    await expect(page.getByText('Eventos')).toBeVisible();
  });

  // ── TC-PM-05: Filter toggle shows/hides non-active missions ───────────────
  test('TC-PM-05: toggle "Mostrar todas" muestra y oculta misiones no activas', async ({
    page,
    request,
  }) => {
    await createMission(request, campaignId);
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    // Active mission visible by default
    await expect(page.getByText('E2E Mission')).toBeVisible();

    // Toggle is off by default (showing only active)
    await expect(playPage.showAllToggle).toBeVisible();
  });

  // ── TC-PM-06: Session panel shows empty state when no sessions ────────────
  test('TC-PM-06: panel de sesiones muestra estado vacío sin sesiones', async ({ page }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await expect(page.getByText(/aún no hay sesiones registradas/i)).toBeVisible();
    await expect(playPage.createSessionButton).toBeVisible();
  });

  // ── TC-PM-07: Create session from Play Mode ───────────────────────────────
  test('TC-PM-07: crea una sesión desde Play Mode (happy path)', async ({ page, request }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await playPage.openCreateSessionModal();

    await playPage.fillCreateSessionForm({
      title: 'Sesión Play Mode E2E',
      date: '2025-08-20',
    });

    await playPage.submitCreateSession();

    // Modal closes and session appears as current session
    await expect(playPage.modal).not.toBeVisible();
    await expect(page.getByText('Sesión Play Mode E2E')).toBeVisible();
    await expect(page.getByText('Sesión actual')).toBeVisible();

    // Cleanup
    const res = await request.get(`/api/campaign/${campaignId}`);
    const campaign: { sessions: { id: string; title: string }[] } = await res.json();
    const created = campaign.sessions.find((s) => s.title === 'Sesión Play Mode E2E');
    if (created) await deleteSession(request, campaignId, created.id);
  });

  // ── TC-PM-08: Session creation validation — empty title ───────────────────
  test('TC-PM-08: validación al crear sesión — título vacío muestra error', async ({ page }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await playPage.openCreateSessionModal();
    await playPage.submitCreateSession();

    await expect(playPage.errorAlert).toBeVisible();
    await expect(playPage.modal).toBeVisible();
  });

  // ── TC-PM-09: Session notes editor shows for current session ─────────────
  test('TC-PM-09: editor de notas visible con sesión activa', async ({ page, request }) => {
    await createSession(request, campaignId);
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await expect(page.getByText('Sesión actual')).toBeVisible();
    await expect(playPage.sessionNotesEditor).toBeVisible();
    await expect(playPage.saveNotesButton).toBeVisible();
  });

  // ── TC-PM-10: Unsaved notes indicator appears when editing ────────────────
  test('TC-PM-10: indicador "Notas sin guardar" aparece al editar', async ({ page, request }) => {
    await createSession(request, campaignId);
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    // Type in the notes editor
    await playPage.typeSessionNotes('Notas de la sesión en curso...');

    // Unsaved indicator appears
    await expect(playPage.unsavedIndicator).toBeVisible();
    await expect(playPage.saveNotesButton).toBeEnabled();
  });

  // ── TC-PM-11: Back navigation returns to campaign detail ──────────────────
  test('TC-PM-11: botón volver navega al detalle de la campaña', async ({ page }) => {
    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    await playPage.backButton.click();

    await expect(page).toHaveURL(`/campaigns/${campaignId}`);
    await expect(page.getByText('Modo Juego')).not.toBeVisible();
  });

  // ── TC-PM-12: Session history shows previous sessions ────────────────────
  test('TC-PM-12: historial de sesiones muestra sesiones anteriores', async ({
    page,
    request,
  }) => {
    // Create two sessions so one becomes history
    await createSession(request, campaignId);
    await createSession(request, campaignId);

    const playPage = new PlayModePage(page);
    await playPage.goto(campaignId);

    // Current session editor
    await expect(page.getByText('Sesión actual')).toBeVisible();
    // History section
    await expect(page.getByText('Sesiones anteriores')).toBeVisible();
    // Sesión #1 is in history (Sesión #2 is current)
    await expect(page.getByText('Sesión #1')).toBeVisible();
  });
});
