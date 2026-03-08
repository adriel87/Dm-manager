import { test, expect } from '@playwright/test';
import { createCampaign, deleteCampaign, deleteSession } from './helpers/api';

test.describe('Campaign Detail (/campaigns/[id])', () => {
  let campaignId: string;

  test.beforeEach(async ({ request }) => {
    const campaign = await createCampaign(request, 'Detail Test Campaign');
    campaignId = campaign.id;
  });

  test.afterEach(async ({ request }) => {
    await deleteCampaign(request, campaignId);
  });

  test('TC-07: muestra header y tres tabs', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);
    await expect(page.getByRole('heading', { name: 'Detail Test Campaign' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Misiones/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Sesiones/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Grupos/ })).toBeVisible();
  });

  test('TC-08: tab Misiones muestra empty state', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);
    await expect(page.getByRole('tab', { name: /Misiones/ })).toBeVisible();
    // Empty state visible cuando no hay misiones
    await expect(page.getByText(/sin misiones/i)).toBeVisible();
  });

  test('TC-09: crea una sesión vía modal (happy path)', async ({ page, request }) => {
    await page.goto(`/campaigns/${campaignId}`);
    await page.getByRole('tab', { name: /Sesiones/ }).click();
    await page.getByRole('button', { name: 'Crear nueva sesión' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await page.getByLabel('Título de la sesión').fill('Sesión E2E');
    await page.getByLabel('Número de sesión').fill('1');
    await page.getByLabel('Fecha de la sesión').fill('2025-06-15');
    await page.getByLabel('Notas de la sesión').fill('Notas de prueba E2E');

    await modal.getByRole('button', { name: 'Crear sesión' }).click();
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Sesión E2E')).toBeVisible();

    // Cleanup
    const res = await request.get('/api/session');
    const sessions: { id: string; title: string; campaignId: string }[] = await res.json();
    const created = sessions.find(
      (s) => s.title === 'Sesión E2E' && s.campaignId === campaignId
    );
    if (created) await deleteSession(request, created.id);
  });

  test('TC-10: validación sesión — título vacío muestra error', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);
    await page.getByRole('tab', { name: /Sesiones/ }).click();
    await page.getByRole('button', { name: 'Crear nueva sesión' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Crear sesión' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('TC-11: link "Campañas" vuelve al dashboard', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);
    await page.getByRole('link', { name: 'Volver a la lista de campañas' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Campañas' })).toBeVisible();
  });

  test('TC-12: cambiar de tab cambia el contenido visible', async ({ page }) => {
    await page.goto(`/campaigns/${campaignId}`);

    await page.getByRole('tab', { name: /Sesiones/ }).click();
    await expect(page.getByText(/sin sesiones/i)).toBeVisible();

    await page.getByRole('tab', { name: /Grupos/ }).click();
    await expect(page.getByText(/sin grupos/i)).toBeVisible();
  });
});
