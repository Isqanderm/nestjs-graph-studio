import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for IssuesView component
 * Provides methods to interact with the issues list
 */
export class IssuesViewPage {
  readonly page: Page;
  readonly summaryBar: Locator;
  readonly issueItems: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summaryBar = page.locator('[data-testid="issues-summary"]');
    this.issueItems = page.locator('[data-testid="issue-item"]');
    this.emptyState = page.locator('[data-testid="issues-empty-state"]');
  }

  /**
   * Navigate to the Issues view
   */
  async goto() {
    await this.page.goto('/graph-studio#/issues');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the summary bar to load
   */
  async waitForSummary(timeout = 5000) {
    await this.summaryBar.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the count of visible issue items
   */
  async getIssueCount(): Promise<number> {
    return await this.issueItems.count();
  }
}
