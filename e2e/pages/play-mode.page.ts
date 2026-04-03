import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Play Mode page (/campaigns/[id]/play)
 *
 * Encapsulates all locators and interactions for the play mode view,
 * including the two-panel layout, mission expansion, status toggle,
 * session notes editor, and session history.
 */
export class PlayModePage {
  readonly page: Page;

  // Header
  readonly backButton: Locator;
  readonly playModeLabel: Locator;
  readonly unsavedIndicator: Locator;

  // Mission panel
  readonly missionPanel: Locator;
  readonly missionPanelHeading: Locator;
  readonly showAllToggle: Locator;

  // Session panel
  readonly sessionPanel: Locator;
  readonly sessionPanelHeading: Locator;
  readonly createSessionButton: Locator;
  readonly sessionNotesEditor: Locator;
  readonly saveNotesButton: Locator;

  // Modals & alerts
  readonly modal: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.backButton = page.getByRole('button', { name: 'Volver al detalle de la campaña' });
    this.playModeLabel = page.getByText('Modo Juego');
    this.unsavedIndicator = page.getByText('Notas sin guardar');

    // Mission panel
    this.missionPanel = page.getByRole('region', { name: /misiones/i });
    this.missionPanelHeading = page.getByRole('heading', { name: 'Misiones', level: 2 });
    this.showAllToggle = page.getByLabel('Mostrar todas las misiones');

    // Session panel
    this.sessionPanel = page.getByRole('region', { name: /sesiones/i });
    this.sessionPanelHeading = page.getByRole('heading', { name: 'Sesiones', level: 2 });
    this.createSessionButton = page.getByRole('button', { name: 'Crear nueva sesión' });
    this.sessionNotesEditor = page.getByLabel('Notas de la sesión');
    this.saveNotesButton = page.getByRole('button', { name: 'Guardar notas' });

    // Modals & alerts
    this.modal = page.getByRole('dialog');
    this.errorAlert = page.getByRole('alert');
  }

  async goto(campaignId: string) {
    await this.page.goto(`/campaigns/${campaignId}/play`);
  }

  /** Assert the play mode header shows the campaign name. */
  async expectCampaignName(name: string) {
    await expect(this.page.getByRole('heading', { name, level: 1 })).toBeVisible();
  }

  /** Assert both panels are visible. */
  async expectTwoPanels() {
    await expect(this.missionPanelHeading).toBeVisible();
    await expect(this.sessionPanelHeading).toBeVisible();
  }

  /** Expand a mission card by its name. */
  async expandMission(name: string) {
    await this.page
      .getByRole('button', { name: new RegExp(name, 'i') })
      .first()
      .click();
  }

  /** Get the expand button for a specific mission. */
  getMissionCard(name: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }

  /** Change mission status via the Select dropdown. */
  async changeMissionStatus(missionName: string, newStatus: string) {
    const card = this.getMissionCard(missionName);
    await card.getByLabel('Cambiar estado de la misión').click();
    await this.page.getByRole('option', { name: newStatus }).click();
  }

  /** Open the create session modal. */
  async openCreateSessionModal() {
    await this.createSessionButton.click();
    await expect(this.modal).toBeVisible();
  }

  /** Fill the create session modal form. */
  async fillCreateSessionForm(opts: { title: string; date: string; notes?: string }) {
    await this.modal.getByLabel('Título de la sesión').fill(opts.title);
    await this.modal.getByLabel('Fecha de la sesión').fill(opts.date);
    if (opts.notes) await this.modal.getByLabel('Notas de la sesión').fill(opts.notes);
  }

  /** Submit the create session modal. */
  async submitCreateSession() {
    await this.modal.getByRole('button', { name: 'Crear sesión' }).click();
  }

  /** Type notes in the inline session notes editor. */
  async typeSessionNotes(notes: string) {
    await this.sessionNotesEditor.fill(notes);
  }

  /** Save the inline session notes. */
  async saveSessionNotes() {
    await this.saveNotesButton.click();
  }

  /** Expand a history session by its number or title. */
  async expandHistorySession(sessionTitle: string) {
    await this.page
      .getByRole('button', { name: new RegExp(sessionTitle, 'i') })
      .click();
  }

  /** Open the edit session modal for a history session. */
  async openEditSessionModal(sessionTitle: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: sessionTitle });
    await item.getByRole('button', { name: /editar/i }).click();
    await expect(this.modal).toBeVisible();
  }

  /** Fill the edit session modal. */
  async fillEditSessionForm(opts: { title?: string; notes?: string; date?: string }) {
    if (opts.title !== undefined)
      await this.modal.getByLabel('Título de la sesión').fill(opts.title);
    if (opts.notes !== undefined)
      await this.modal.getByLabel('Notas de la sesión').fill(opts.notes);
    if (opts.date !== undefined)
      await this.modal.getByLabel('Fecha de la sesión').fill(opts.date);
  }

  /** Submit the edit session modal. */
  async submitEditSession() {
    await this.modal.getByRole('button', { name: 'Guardar cambios' }).click();
  }
}
