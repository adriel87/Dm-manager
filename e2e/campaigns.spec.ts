import { test, expect } from '@playwright/test';
import { createCampaign, deleteCampaign } from './helpers/api';
import { CampaignsPage } from './pages/campaigns.page';

/**
 * E2E — Campaigns list page (/campaigns)
 *
 * Covers: listing, creation modal (happy path, validation, cancel), navigation.
 * Data isolation: each test that creates a campaign cleans it up via API.
 */
test.describe('Campaigns page (/campaigns)', () => {

  // ── TC-01: Page renders correctly ─────────────────────────────────────────
  test('TC-01: muestra el heading Campañas', async ({ page }) => {
    const campaignsPage = new CampaignsPage(page);
    await campaignsPage.goto();
    await expect(campaignsPage.heading).toBeVisible();
  });

  // ── TC-02: Campaign seeded via API is visible in the list ──────────────────
  test('TC-02: muestra tarjeta de campaña creada vía API', async ({ page, request }) => {
    const campaign = await createCampaign(request, 'Dashboard Smoke Test');
    try {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();
      await expect(campaignsPage.campaignCard('Dashboard Smoke Test')).toBeVisible();
    } finally {
      await deleteCampaign(request, campaign.id);
    }
  });

  // ── TC-03: Create campaign — happy path ────────────────────────────────────
  test('TC-03: crea una campaña vía modal (happy path)', async ({ page, request }) => {
    const campaignsPage = new CampaignsPage(page);
    await campaignsPage.goto();

    await campaignsPage.openCreateModal();
    await campaignsPage.fillForm('Mi Campaña E2E', 'Campaña de prueba automatizada');
    await campaignsPage.submit();

    // Modal closes and campaign appears in the list
    await expect(campaignsPage.modal).not.toBeVisible();
    await expect(campaignsPage.campaignCard('Mi Campaña E2E')).toBeVisible();

    // Cleanup
    const res = await request.get('/api/campaign');
    const campaigns: { id: string; name: string }[] = await res.json();
    const created = campaigns.find((c) => c.name === 'Mi Campaña E2E');
    if (created) await deleteCampaign(request, created.id);
  });

  // ── TC-04: Validation — empty name shows error ─────────────────────────────
  test('TC-04: muestra error de validación cuando el nombre está vacío', async ({ page }) => {
    const campaignsPage = new CampaignsPage(page);
    await campaignsPage.goto();

    await campaignsPage.openCreateModal();
    await campaignsPage.submit();

    // Error alert is visible and modal stays open
    await expect(campaignsPage.errorAlert).toBeVisible();
    await expect(campaignsPage.modal).toBeVisible();
  });

  // ── TC-05: Cancel closes modal and resets form ─────────────────────────────
  test('TC-05: cancelar cierra el modal y resetea el formulario', async ({ page }) => {
    const campaignsPage = new CampaignsPage(page);
    await campaignsPage.goto();

    await campaignsPage.openCreateModal();
    await campaignsPage.fillForm('Draft');
    await campaignsPage.cancel();
    await expect(campaignsPage.modal).not.toBeVisible();

    // Reopen: form should be reset
    await campaignsPage.openCreateModal();
    await expect(campaignsPage.nameInput).toHaveValue('');
  });

  // ── TC-06: Clicking campaign card navigates to detail ──────────────────────
  test('TC-06: click en tarjeta navega a detalle de campaña', async ({ page, request }) => {
    const campaign = await createCampaign(request, 'Navigation Test Campaign');
    try {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      await campaignsPage.campaignCard('Navigation Test Campaign').click();

      await expect(page).toHaveURL(new RegExp(`/campaigns/${campaign.id}`));
      await expect(
        page.getByRole('heading', { name: 'Navigation Test Campaign' })
      ).toBeVisible();
    } finally {
      await deleteCampaign(request, campaign.id);
    }
  });
});
