import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for LiveView component
 * Provides methods to interact with the live events view
 */
export class LiveViewPage {
  readonly page: Page;
  readonly eventsList: Locator;
  readonly searchInput: Locator;
  readonly filterButtons: Locator;
  readonly clearButton: Locator;
  readonly connectionStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventsList = page.locator('[data-testid="events-list"], .events-list, ul[role="list"]');
    this.searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    this.filterButtons = page.locator('[data-testid="filter-buttons"], .filter-buttons');
    this.clearButton = page.locator('button:has-text("Clear")');
    this.connectionStatus = page.locator('[data-testid="connection-status"], .connection-status');
  }

  /**
   * Navigate to the Live view
   */
  async goto() {
    await this.page.goto('/live');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for events to load
   */
  async waitForEvents(timeout = 5000) {
    await this.eventsList.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the count of visible events
   */
  async getEventCount(): Promise<number> {
    const events = await this.eventsList.locator('li, [data-testid="event-item"]').count();
    return events;
  }

  /**
   * Search for events
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(300);
  }

  /**
   * Filter events by type
   */
  async filterByType(type: string) {
    const filterButton = this.page.locator(`button:has-text("${type}")`);
    await filterButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear all events
   */
  async clearAllEvents() {
    if (await this.clearButton.isVisible({ timeout: 1000 })) {
      await this.clearButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Check if connected to SSE stream
   */
  async isConnected(): Promise<boolean> {
    const status = await this.connectionStatus.textContent().catch(() => '');
    return status.toLowerCase().includes('connected');
  }

  /**
   * Get event details by index
   */
  async getEventDetails(index: number): Promise<string> {
    const event = this.eventsList.locator('li, [data-testid="event-item"]').nth(index);
    return await event.textContent() || '';
  }
}

