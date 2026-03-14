import { test, expect } from '@playwright/test';
import { createCharacter, deleteCharacter } from './helpers/api';
import { CharactersPage } from './pages/characters.page';

/**
 * E2E — Characters page (/characters)
 *
 * Covers: page render, filter buttons (Todos/PC/NPC), creation modal
 * (happy path, validation), filter behaviour.
 * Data isolation: all characters created in tests are deleted after use.
 */
test.describe('Characters page (/characters)', () => {

  // ── TC-13: Page renders correctly ─────────────────────────────────────────
  test('TC-13: muestra el heading Personajes', async ({ page }) => {
    const charactersPage = new CharactersPage(page);
    await charactersPage.goto();
    await expect(charactersPage.heading).toBeVisible();
  });

  // ── TC-14: Filter buttons are visible ─────────────────────────────────────
  test('TC-14: muestra los botones de filtro Todos / PC / NPC', async ({ page }) => {
    const charactersPage = new CharactersPage(page);
    await charactersPage.goto();
    await expect(charactersPage.filterAll).toBeVisible();
    await expect(charactersPage.filterPC).toBeVisible();
    await expect(charactersPage.filterNPC).toBeVisible();
  });

  // ── TC-15: Create a PC character — happy path ──────────────────────────────
  test('TC-15: crea un personaje PC vía modal (happy path)', async ({ page, request }) => {
    const charactersPage = new CharactersPage(page);
    await charactersPage.goto();

    await charactersPage.openCreateModal();
    await charactersPage.fillName('Gandalf E2E');
    await charactersPage.submit();

    // Modal closes and character appears in the list
    await expect(charactersPage.modal).not.toBeVisible();
    await expect(charactersPage.characterCard('Gandalf E2E')).toBeVisible();

    // Cleanup
    const res = await request.get('/api/character');
    const chars: { id: string; name: string }[] = await res.json();
    const created = chars.find((c) => c.name === 'Gandalf E2E');
    if (created) await deleteCharacter(request, created.id);
  });

  // ── TC-16: NPC appears in NPC filter and NOT in PC filter ─────────────────
  test('TC-16: NPC aparece en filtro NPCs y no en filtro PC', async ({ page, request }) => {
    const npc = await createCharacter(request, { name: 'Goblin King E2E', isNPC: true });
    try {
      const charactersPage = new CharactersPage(page);
      await charactersPage.goto();

      // "Todos" filter — NPC is visible
      await expect(charactersPage.characterCard('Goblin King E2E')).toBeVisible();

      // "NPCs" filter — still visible
      await charactersPage.filterNPC.click();
      await expect(charactersPage.characterCard('Goblin King E2E')).toBeVisible();

      // "PC" filter — hidden
      await charactersPage.filterPC.click();
      await expect(charactersPage.characterCard('Goblin King E2E')).not.toBeVisible();
    } finally {
      await deleteCharacter(request, npc.id);
    }
  });

  // ── TC-17: PC filter shows PCs and hides NPCs ──────────────────────────────
  test('TC-17: filtro PC muestra PCs y oculta NPCs', async ({ page, request }) => {
    const pc = await createCharacter(request, { name: 'Aragorn E2E', isNPC: false });
    const npc = await createCharacter(request, { name: 'Orc E2E', isNPC: true });
    try {
      const charactersPage = new CharactersPage(page);
      await charactersPage.goto();

      await charactersPage.filterPC.click();
      await expect(charactersPage.characterCard('Aragorn E2E')).toBeVisible();
      await expect(charactersPage.characterCard('Orc E2E')).not.toBeVisible();
    } finally {
      await deleteCharacter(request, pc.id);
      await deleteCharacter(request, npc.id);
    }
  });

  // ── TC-18: Validation — empty name shows error ─────────────────────────────
  test('TC-18: validación — nombre vacío muestra error', async ({ page }) => {
    const charactersPage = new CharactersPage(page);
    await charactersPage.goto();

    await charactersPage.openCreateModal();
    await charactersPage.submit();

    // Error alert visible and modal stays open
    await expect(charactersPage.errorAlert).toBeVisible();
    await expect(charactersPage.modal).toBeVisible();
  });
});
