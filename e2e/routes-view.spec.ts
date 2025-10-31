import { test, expect } from './fixtures/base';

/**
 * RoutesView E2E Tests
 * Simple smoke tests to verify the Routes view loads and renders correctly
 */
test.describe('RoutesView E2E', () => {
  test.beforeEach(async ({ routesViewPage }) => {
    await routesViewPage.goto();
  });

  test.describe('Basic Rendering', () => {
    test('should load the page successfully', async ({ page }) => {
      // Verify the page loaded
      expect(page.url()).toContain('/graph-studio');
      expect(page.url()).toContain('#/routes');

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
    });

    test('should render the routes table', async ({ routesViewPage }) => {
      // Wait for routes table to be visible
      await routesViewPage.waitForRoutes(10000);

      // Verify routes table is visible
      const isVisible = await routesViewPage.routesTable.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should display routes data', async ({ routesViewPage }) => {
      // Wait for routes to load
      await routesViewPage.waitForRoutes(10000);

      // Verify there are route rows
      const routeCount = await routesViewPage.getRouteCount();
      expect(routeCount).toBeGreaterThan(0);
    });

    test('should not have console errors', async ({ page, routesViewPage }) => {
      const consoleErrors: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait for routes to load
      await routesViewPage.waitForRoutes(10000);

      // Wait a bit for any async errors
      await page.waitForTimeout(1000);

      // Filter out known non-critical errors (e.g., React DevTools)
      const criticalErrors = consoleErrors.filter(
        (error) => !error.includes('Download the React DevTools')
      );

      // Verify no critical console errors
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation to Graph view', async ({ page, routesViewPage }) => {
      await routesViewPage.waitForRoutes(10000);

      // Find and click Graph link (look for the navigation link with "Graph" text)
      const graphLink = page.locator('nav a', { hasText: 'Graph' }).first();
      await graphLink.waitFor({ state: 'visible', timeout: 5000 });
      await graphLink.click();

      // Verify navigation (hash router will show #/ or just the base URL)
      await page.waitForTimeout(1000); // Wait for navigation
      expect(page.url()).toContain('/graph-studio');
      // Verify we're not on routes anymore
      expect(page.url()).not.toContain('#/routes');
    });
  });
});

