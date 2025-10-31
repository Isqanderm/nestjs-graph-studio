import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for RoutesView component
 * Provides methods to interact with the routes table
 */
export class RoutesViewPage {
  readonly page: Page;
  readonly routesTable: Locator;
  readonly searchInput: Locator;
  readonly methodFilters: Locator;
  readonly routeRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.routesTable = page.locator('[data-testid="routes-table"], table, .routes-table');
    this.searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    this.methodFilters = page.locator('[data-testid="method-filters"], .method-filters');
    this.routeRows = page.locator('tbody tr, [data-testid="route-row"]');
  }

  /**
   * Navigate to the Routes view
   */
  async goto() {
    await this.page.goto('/routes');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for routes table to load
   */
  async waitForRoutes(timeout = 5000) {
    await this.routesTable.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the count of visible routes
   */
  async getRouteCount(): Promise<number> {
    return await this.routeRows.count();
  }

  /**
   * Search for routes
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
   * Filter routes by HTTP method
   */
  async filterByMethod(method: string) {
    const filterButton = this.page.locator(`button:has-text("${method}")`);
    await filterButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get route details by index
   */
  async getRouteDetails(index: number): Promise<string> {
    const route = this.routeRows.nth(index);
    return await route.textContent() || '';
  }

  /**
   * Click on a route row
   */
  async clickRoute(index: number) {
    const route = this.routeRows.nth(index);
    await route.click();
    await this.page.waitForTimeout(300);
  }
}

