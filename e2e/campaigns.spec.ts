import { test, expect } from '@playwright/test';
import { createCampaign, deleteCampaign } from './helpers/api';

test.describe('Campaign Dashboard (/)', () => {

  test('TC-01: muestra el heading Campañas', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Campañas' })).toBeVisible();
  });

  test('TC-02: muestra tarjeta de campaña creada vía API', async ({ page, request }) => {
    const campaign = await createCampaign(request, 'Dashboard Smoke Test');
    try {
      await page.goto('/');
      await expect(
        page.getByRole('link', { name: /Abrir campaña: Dashboard Smoke Test/ })
      ).toBeVisible();
    } finally {
      await deleteCampaign(request, campaign.id);
    }
  });

  test('TC-03: crea una campaña vía modal (happy path)', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear nueva campaña' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await page.getByLabel('Nombre de la campaña').fill('Mi Campaña E2E');
    await page.getByLabel('Descripción de la campaña').fill('Campaña de prueba automatizada');

    await modal.getByRole('button', { name: 'Crear campaña' }).click();

    await expect(modal).not.toBeVisible();
    await expect(
      page.getByRole('link', { name: /Abrir campaña: Mi Campaña E2E/ })
    ).toBeVisible();

    // Cleanup
    const res = await request.get('/api/campaign');
    const campaigns: { id: string; name: string }[] = await res.json();
    const created = campaigns.find((c) => c.name === 'Mi Campaña E2E');
    if (created) await deleteCampaign(request, created.id);
  });

  test('TC-04: muestra error de validación cuando el nombre está vacío', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear nueva campaña' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: 'Crear campaña' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('TC-05: cancelar cierra el modal y resetea el formulario', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear nueva campaña' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await page.getByLabel('Nombre de la campaña').fill('Draft');
    await modal.getByRole('button', { name: 'Cancelar' }).click();
    await expect(modal).not.toBeVisible();

    // Reabrir: form reseteado
    await page.getByRole('button', { name: 'Crear nueva campaña' }).click();
    await expect(modal).toBeVisible();
    await expect(page.getByLabel('Nombre de la campaña')).toHaveValue('');
  });

  test('TC-06: click en tarjeta navega a detalle de campaña', async ({ page, request }) => {
    const campaign = await createCampaign(request, 'Navigation Test Campaign');
    try {
      await page.goto('/');
      await page.getByRole('link', { name: /Abrir campaña: Navigation Test Campaign/ }).click();
      await expect(page).toHaveURL(new RegExp(`/campaigns/${campaign.id}`));
      await expect(
        page.getByRole('heading', { name: 'Navigation Test Campaign' })
      ).toBeVisible();
    } finally {
      await deleteCampaign(request, campaign.id);
    }
  });
});
