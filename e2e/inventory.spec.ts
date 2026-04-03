import { test, expect } from '@playwright/test';
import { createCampaign, deleteCampaign, deleteInventoryItem } from './helpers/api';
import { CampaignDetailPage } from './pages/campaign-detail.page';

/**
 * E2E — Campaign Inventory tab (/campaigns/[id])
 *
 * Covers: tab visibility, empty state, item creation (happy path + validation),
 * and cancel behaviour.
 *
 * Setup: a fresh campaign is created via API before each test and deleted after.
 * This ensures full test isolation with no dependency on existing DB state.
 */
test.describe('Campaign Inventory tab (/campaigns/[id])', () => {
  let campaignId: string;

  test.beforeEach(async ({ request }) => {
    const campaign = await createCampaign(request, 'Inventory Test Campaign');
    campaignId = campaign.id;
  });

  test.afterEach(async ({ request }) => {
    await deleteCampaign(request, campaignId);
  });

  // ── TC-13: Inventory tab is visible on campaign detail ────────────────────
  test('TC-13: pestaña Inventario visible en detalle de campaña', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await expect(detailPage.tabInventory).toBeVisible();
  });

  // ── TC-14: Inventory tab shows empty state ────────────────────────────────
  test('TC-14: pestaña Inventario muestra estado vacío', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('inventory');

    await expect(page.getByRole('heading', { name: 'Inventario' })).toBeVisible();
    await expect(page.getByText(/sin objetos/i)).toBeVisible();
  });

  // ── TC-15: Create inventory item — happy path ─────────────────────────────
  test('TC-15: crea un objeto vía modal (happy path)', async ({ page, request }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('inventory');
    await detailPage.openCreateInventoryModal();

    await detailPage.fillInventoryForm({
      title: 'Espada E2E',
      description: 'Una espada forjada en pruebas automatizadas',
      quantity: 1,
    });

    await detailPage.submitInventory();

    // Modal closes and item appears in the list
    await expect(detailPage.modal).not.toBeVisible();
    await expect(page.getByText('Espada E2E')).toBeVisible();

    // Cleanup: find and delete the created item
    const res = await request.get(`/api/campaign/${campaignId}`);
    const campaign: { inventory: { id: string; title: string }[] } = await res.json();
    const created = campaign.inventory?.find((i) => i.title === 'Espada E2E');
    if (created) await deleteInventoryItem(request, campaignId, created.id);
  });

  // ── TC-16: Validation — empty title shows error ───────────────────────────
  test('TC-16: validación — título vacío muestra error', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('inventory');
    await detailPage.openCreateInventoryModal();
    await detailPage.submitInventory();

    // Error alert visible; modal stays open
    await expect(detailPage.errorAlert).toBeVisible();
    await expect(detailPage.modal).toBeVisible();
  });

  // ── TC-17: Cancel closes modal and resets form ────────────────────────────
  test('TC-17: cancelar cierra el modal y resetea el formulario', async ({ page }) => {
    const detailPage = new CampaignDetailPage(page);
    await detailPage.goto(campaignId);

    await detailPage.clickTab('inventory');
    await detailPage.openCreateInventoryModal();
    await detailPage.fillInventoryForm({ title: 'Borrador' });

    // Cancel via the modal cancel button
    await detailPage.modal.getByRole('button', { name: 'Cancelar' }).click();
    await expect(detailPage.modal).not.toBeVisible();

    // Reopen: form should be reset
    await detailPage.openCreateInventoryModal();
    await expect(detailPage.inventoryTitleInput).toHaveValue('');
  });
});
