import { test, expect } from '@playwright/test';
import { createCampaign, deleteCampaign, deleteSession } from './helpers/api';
import { CampaignDetailPage } from './pages/campaign-detail.page';

/**
 * E2E — Campaign Detail page (/campaigns/[id])
 *
 * Covers: header, tab navigation, empty states, session creation (happy path +
 * validation), and back navigation.
 *
 * Setup: a fresh campaign is created via API before each test and deleted after.
 * This ensures full test isolation with no dependency on existing DB state.
 */
test.describe('Campaign Detail page (/campaigns/[id])', () => {
  let campaignId: string;

  test.beforeEach(async ({ request }) => {
    const campaign = await createCampaign(request, 'Detail Test Campaign');
    campaignId = campaign.id;
  });

  test.afterEach(async ({ request }) => {
    await deleteCampaign(request, campaignId);
  });

  // ── TC-07: Header and all three tabs render ────────────────────────────────
  test('TC-07: muestra header y las tres pestañas', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.expectHeading('Detail Test Campaign');
    await expect(detailPage.tabMissions).toBeVisible();
    await expect(detailPage.tabSessions).toBeVisible();
    await expect(detailPage.tabGroups).toBeVisible();
  });

  // ── TC-08: Missions tab shows empty state ─────────────────────────────────
  test('TC-08: pestaña Misiones muestra estado vacío', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await expect(detailPage.tabMissions).toBeVisible();
    // Missions tab is active by default; no missions → empty state visible
    await expect(page.getByText(/sin misiones/i)).toBeVisible();
  });

  // ── TC-09: Create session — happy path ────────────────────────────────────
  test('TC-09: crea una sesión vía modal (happy path)', async ({ page, request }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('sessions');
    await detailPage.openCreateSessionModal();

    await detailPage.fillSessionForm({
      title: 'Sesión E2E',
      sessionNumber: '1',
      date: '2025-06-15',
      notes: 'Notas de prueba E2E',
    });

    await detailPage.submitSession();

    // Modal closes and session appears
    await expect(detailPage.modal).not.toBeVisible();
    await expect(page.getByText('Sesión E2E')).toBeVisible();

    // Cleanup: find and delete the created session
    const res = await request.get('/api/session');
    const sessions: { id: string; title: string; campaignId: string }[] = await res.json();
    const created = sessions.find(
      (s) => s.title === 'Sesión E2E' && s.campaignId === campaignId
    );
    if (created) await deleteSession(request, created.id);
  });

  // ── TC-10: Session validation — empty title shows error ───────────────────
  test('TC-10: validación sesión — título vacío muestra error', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('sessions');
    await detailPage.openCreateSessionModal();
    await detailPage.submitSession();

    // Error alert visible; modal stays open
    await expect(detailPage.errorAlert).toBeVisible();
    await expect(detailPage.modal).toBeVisible();
  });

  // ── TC-11: Back link navigates to dashboard (home) ────────────────────────
  test('TC-11: link "Campañas" vuelve al dashboard', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.backLink.click();

    // CampaignDetailHeader back link points to '/' (dashboard)
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  // ── TC-12: Switching tabs changes visible content ──────────────────────────
  test('TC-12: cambiar de pestaña cambia el contenido visible', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    // Sessions tab → empty state for sessions
    await detailPage.clickTab('sessions');
    await expect(page.getByText(/sin sesiones/i)).toBeVisible();

    // Groups tab → empty state for groups
    await detailPage.clickTab('groups');
    await expect(page.getByText(/sin grupos/i)).toBeVisible();
  });
});
