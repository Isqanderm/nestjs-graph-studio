import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for GraphView component
 * Provides methods to interact with the graph visualization
 */
export class GraphViewPage {
  readonly page: Page;
  readonly graphContainer: Locator;
  readonly searchInput: Locator;
  readonly nodeDetailsPanel: Locator;
  readonly layoutButtons: Locator;
  readonly zoomControls: Locator;
  readonly filterControls: Locator;

  constructor(page: Page) {
    this.page = page;
    this.graphContainer = page.locator('#cy, [data-testid="graph-container"], .graph-view');
    this.searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    this.nodeDetailsPanel = page.locator('[data-testid="node-details"], .node-details, aside');
    this.layoutButtons = page.locator('button[data-layout], button:has-text("Layout")');
    this.zoomControls = page.locator('[data-testid="zoom-controls"], .zoom-controls');
    this.filterControls = page.locator('[data-testid="filter-controls"], .filter-controls');
  }

  /**
   * Navigate to the Graph view
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the graph to be loaded and rendered
   */
  async waitForGraphToLoad(timeout = 5000) {
    await this.graphContainer.waitFor({ state: 'visible', timeout });
    // Wait a bit for Cytoscape to initialize
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if the graph container is visible
   */
  async isGraphVisible(): Promise<boolean> {
    return await this.graphContainer.isVisible();
  }

  /**
   * Search for a node by name
   */
  async searchNode(nodeName: string) {
    await this.searchInput.fill(nodeName);
    await this.page.waitForTimeout(300); // Debounce delay
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(300);
  }

  /**
   * Click on a node in the graph (by simulating a click at coordinates)
   * Note: This is a simplified version - actual implementation may need to interact with Cytoscape API
   */
  async clickNode(nodeName: string) {
    // First search for the node to highlight it
    await this.searchNode(nodeName);
    
    // Click on the graph container (Cytoscape will handle the click)
    await this.graphContainer.click({ position: { x: 100, y: 100 } });
  }

  /**
   * Check if node details panel is visible
   */
  async isNodeDetailsPanelVisible(): Promise<boolean> {
    try {
      return await this.nodeDetailsPanel.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Get the text content of the node details panel
   */
  async getNodeDetailsText(): Promise<string> {
    return await this.nodeDetailsPanel.textContent() || '';
  }

  /**
   * Check if a specific node type is visible in the details
   */
  async hasNodeType(type: string): Promise<boolean> {
    const text = await this.getNodeDetailsText();
    return text.toLowerCase().includes(type.toLowerCase());
  }

  /**
   * Apply a layout (e.g., 'dagre', 'circle', 'grid')
   */
  async applyLayout(layoutName: string) {
    const layoutButton = this.page.locator(`button[data-layout="${layoutName}"], button:has-text("${layoutName}")`);
    if (await layoutButton.isVisible({ timeout: 1000 })) {
      await layoutButton.click();
      await this.page.waitForTimeout(500); // Wait for layout animation
    }
  }

  /**
   * Zoom in on the graph
   */
  async zoomIn() {
    const zoomInButton = this.page.locator('button[aria-label*="Zoom in" i], button:has-text("+")');
    if (await zoomInButton.isVisible({ timeout: 1000 })) {
      await zoomInButton.click();
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Zoom out on the graph
   */
  async zoomOut() {
    const zoomOutButton = this.page.locator('button[aria-label*="Zoom out" i], button:has-text("-")');
    if (await zoomOutButton.isVisible({ timeout: 1000 })) {
      await zoomOutButton.click();
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Fit the graph to the viewport
   */
  async fitToViewport() {
    const fitButton = this.page.locator('button[aria-label*="Fit" i], button:has-text("Fit")');
    if (await fitButton.isVisible({ timeout: 1000 })) {
      await fitButton.click();
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Filter nodes by type (MODULE, CONTROLLER, PROVIDER, ROUTE)
   */
  async filterByType(type: string) {
    const filterCheckbox = this.page.locator(`input[type="checkbox"][value="${type}"], label:has-text("${type}") input`);
    if (await filterCheckbox.isVisible({ timeout: 1000 })) {
      await filterCheckbox.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Get the count of visible nodes (by checking canvas or DOM)
   */
  async getVisibleNodeCount(): Promise<number> {
    // This is a simplified version - actual implementation would need to query Cytoscape
    // For now, we'll check if there's a stats display
    const statsText = await this.page.locator('[data-testid="graph-stats"], .graph-stats').textContent().catch(() => '');
    const match = statsText.match(/(\d+)\s*nodes?/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Check if the graph is in loading state
   */
  async isLoading(): Promise<boolean> {
    const loadingIndicator = this.page.locator('[data-testid="loading"], .loading, [role="progressbar"]');
    return await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if an error message is displayed
   */
  async hasError(): Promise<boolean> {
    const errorMessage = this.page.locator('[data-testid="error"], .error, [role="alert"]');
    return await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    const errorMessage = this.page.locator('[data-testid="error"], .error, [role="alert"]');
    return await errorMessage.textContent() || '';
  }

  /**
   * Take a screenshot of the graph
   */
  async screenshot(path: string) {
    await this.graphContainer.screenshot({ path });
  }

  /**
   * Wait for the graph to be stable (no animations)
   */
  async waitForStable(timeout = 2000) {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Check if search input is visible
   */
  async isSearchVisible(): Promise<boolean> {
    return await this.searchInput.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Get the placeholder text of the search input
   */
  async getSearchPlaceholder(): Promise<string> {
    return await this.searchInput.getAttribute('placeholder') || '';
  }

  /**
   * Verify the graph view is fully loaded and functional
   */
  async verifyGraphViewLoaded() {
    await expect(this.graphContainer).toBeVisible({ timeout: 10000 });
    await this.waitForStable(1000);
  }

  /**
   * Get all visible navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    const links = await this.page.locator('nav a, [role="navigation"] a').allTextContents();
    return links.filter(link => link.trim().length > 0);
  }

  /**
   * Navigate to a different view (Live, Routes, Graph)
   */
  async navigateTo(viewName: string) {
    const link = this.page.locator(`nav a:has-text("${viewName}"), [role="navigation"] a:has-text("${viewName}")`);
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }
}

