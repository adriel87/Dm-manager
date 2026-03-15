import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Campaign Detail page (/campaigns/[id])
 *
 * Encapsulates all locators and interactions for the campaign detail view,
 * including the tab navigation and creation modals.
 */
export class CampaignDetailPage {
  readonly page: Page;

  // Header
  readonly backLink: Locator;

  // Tabs
  readonly tabMissions: Locator;
  readonly tabSessions: Locator;
  readonly tabGroups: Locator;

  // Session creation
  readonly createSessionButton: Locator;
  readonly modal: Locator;
  readonly sessionTitleInput: Locator;
  readonly sessionDateInput: Locator;
  readonly sessionNotesInput: Locator;
  readonly sessionSubmitButton: Locator;
  readonly sessionCancelButton: Locator;
  readonly errorAlert: Locator;

  // Mission creation
  readonly createMissionButton: Locator;
  readonly missionNameInput: Locator;
  readonly missionSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.backLink = page.getByRole('link', { name: 'Volver a la lista de campañas' });

    this.tabMissions = page.getByRole('tab', { name: /Misiones/ });
    this.tabSessions = page.getByRole('tab', { name: /Sesiones/ });
    this.tabGroups = page.getByRole('tab', { name: /Grupos/ });

    this.modal = page.getByRole('dialog');
    this.createSessionButton = page.getByRole('button', { name: 'Crear nueva sesión' });
    this.sessionTitleInput = page.getByLabel('Título');
    this.sessionDateInput = page.getByLabel('Fecha');
    this.sessionNotesInput = page.getByLabel('Notas');
    this.sessionSubmitButton = this.modal.getByRole('button', { name: 'Crear sesión' });
    this.sessionCancelButton = this.modal.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');

    this.createMissionButton = page.getByRole('button', { name: 'Crear nueva misión' });
    this.missionNameInput = page.getByLabel('Nombre de la misión');
    this.missionSubmitButton = this.modal.getByRole('button', { name: 'Crear misión' });
  }

  async goto(campaignId: string) {
    await this.page.goto(`/campaigns/${campaignId}`);
  }

  /** Asserts the campaign heading is visible with the given name. */
  async expectHeading(name: string) {
    await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible();
  }

  async clickTab(tab: 'missions' | 'sessions' | 'groups') {
    const tabLocator = {
      missions: this.tabMissions,
      sessions: this.tabSessions,
      groups: this.tabGroups,
    }[tab];
    await tabLocator.click();
  }

  async openCreateSessionModal() {
    await this.createSessionButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillSessionForm(opts: {
    title: string;
    date: string;
    notes?: string;
  }) {
    await this.sessionTitleInput.fill(opts.title);
    await this.sessionDateInput.fill(opts.date);
    if (opts.notes) await this.sessionNotesInput.fill(opts.notes);
  }

  async submitSession() {
    await this.sessionSubmitButton.click();
  }
}
