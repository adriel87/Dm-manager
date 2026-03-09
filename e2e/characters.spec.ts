import { test, expect } from '@playwright/test';
import { createCharacter, deleteCharacter } from './helpers/api';

test.describe('Characters Page (/characters)', () => {

  test('TC-13: muestra el heading Personajes', async ({ page }) => {
    await page.goto('/characters');
    await expect(page.getByRole('heading', { name: 'Personajes', exact: true })).toBeVisible();
  });

  test('TC-14: muestra botones de filtro PC/NPC', async ({ page }) => {
    await page.goto('/characters');
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Personajes (PC)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'NPCs' })).toBeVisible();
  });

  test('TC-15: crea un personaje PC vía modal (happy path)', async ({ page, request }) => {
    await page.goto('/characters');
    await page.getByRole('button', { name: 'Crear nuevo personaje' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await page.getByLabel('Nombre').fill('Gandalf E2E');

    await modal.getByRole('button', { name: 'Crear personaje' }).click();
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Gandalf E2E')).toBeVisible();

    // Cleanup
    const res = await request.get('/api/character');
    const chars: { id: string; name: string }[] = await res.json();
    const created = chars.find((c) => c.name === 'Gandalf E2E');
    if (created) await deleteCharacter(request, created.id);
  });

  test('TC-16: NPC aparece en filtro NPCs y no en filtro PC', async ({ page, request }) => {
    const npc = await createCharacter(request, { name: 'Goblin King E2E', isNPC: true });
    try {
      await page.goto('/characters');

      // Filtro "Todos": aparece
      await expect(page.getByText('Goblin King E2E')).toBeVisible();

      // Filtro "NPCs": aparece
      await page.getByRole('button', { name: 'NPCs' }).click();
      await expect(page.getByText('Goblin King E2E')).toBeVisible();

      // Filtro "PC": no aparece
      await page.getByRole('button', { name: 'Personajes (PC)' }).click();
      await expect(page.getByText('Goblin King E2E')).not.toBeVisible();
    } finally {
      await deleteCharacter(request, npc.id);
    }
  });

  test('TC-17: filtro PC oculta NPCs y muestra PCs', async ({ page, request }) => {
    const pc = await createCharacter(request, { name: 'Aragorn E2E', isNPC: false });
    const npc = await createCharacter(request, { name: 'Orc E2E', isNPC: true });
    try {
      await page.goto('/characters');
      await page.getByRole('button', { name: 'Personajes (PC)' }).click();
      await expect(page.getByText('Aragorn E2E')).toBeVisible();
      await expect(page.getByText('Orc E2E')).not.toBeVisible();
    } finally {
      await deleteCharacter(request, pc.id);
      await deleteCharacter(request, npc.id);
    }
  });

  test('TC-18: validación — nombre vacío muestra error', async ({ page }) => {
    await page.goto('/characters');
    await page.getByRole('button', { name: 'Crear nuevo personaje' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Crear personaje' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(modal).toBeVisible();
  });
});
