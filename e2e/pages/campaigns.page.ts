import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Campaigns page (/)
 *
 * Encapsulates all locators and interactions for the campaigns dashboard.
 * Keeps selectors in one place so tests don't break when UI text changes.
 */
export class CampaignsPage {
  readonly page: Page;

  // Header
  readonly heading: Locator;

  // Create modal trigger
  readonly createButton: Locator;

  // Modal
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Campañas', exact: true });
    this.createButton = page.getByRole('button', { name: 'Crear nueva campaña' });

    this.modal = page.getByRole('dialog');
    this.nameInput = page.getByLabel('Nombre de la campaña');
    this.descriptionInput = page.getByLabel('Descripción de la campaña');
    this.submitButton = this.modal.getByRole('button', { name: 'Crear campaña' });
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/campaigns');
  }

  async openCreateModal() {
    await this.createButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillForm(name: string, description?: string) {
    await this.nameInput.fill(name);
    if (description) await this.descriptionInput.fill(description);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  /** Returns the link locator for a campaign card by name. */
  campaignCard(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`Abrir campaña: ${name}`) });
  }
}
