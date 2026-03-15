import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Characters page (/characters)
 *
 * Encapsulates all locators and interactions for the characters list page.
 */
export class CharactersPage {
  readonly page: Page;

  // Header
  readonly heading: Locator;

  // Filter buttons
  readonly filterAll: Locator;
  readonly filterPC: Locator;
  readonly filterNPC: Locator;

  // Create modal trigger
  readonly createButton: Locator;

  // Modal
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;
  readonly npcSwitch: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Personajes', exact: true });

    this.filterAll = page.getByRole('button', { name: 'Todos' });
    this.filterPC = page.getByRole('button', { name: 'Personajes (PC)' });
    this.filterNPC = page.getByRole('button', { name: 'NPCs' });

    this.createButton = page.getByRole('button', { name: 'Crear nuevo personaje' });

    this.modal = page.getByRole('dialog');
    this.nameInput = page.getByLabel('Nombre');
    this.submitButton = this.modal.getByRole('button', { name: 'Crear personaje' });
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');
    this.npcSwitch = page.getByRole('switch', { name: 'Es NPC' });
  }

  async goto() {
    await this.page.goto('/characters');
  }

  async openCreateModal() {
    await this.createButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async enableNPC() {
    const isChecked = await this.npcSwitch.isChecked();
    if (!isChecked) await this.npcSwitch.click();
  }

  /** Returns the card/text locator for a character by name in the list. */
  characterCard(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }
}
