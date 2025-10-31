import { test, expect } from './fixtures/base';

/**
 * GraphView E2E Tests
 * Simple smoke tests to verify the Graph view loads and renders correctly
 */
test.describe('GraphView E2E', () => {
  test.beforeEach(async ({ graphViewPage }) => {
    await graphViewPage.goto();
  });

  test.describe('Basic Rendering', () => {
    test('should load the page successfully', async ({ page }) => {
      // Verify the page loaded
      expect(page.url()).toContain('/graph-studio');

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Verify no navigation errors
      const response = await page.goto('/graph-studio');
      expect(response?.status()).toBeLessThan(400);
    });

    test('should render the graph container', async ({ graphViewPage }) => {
      // Wait for graph container to be visible
      await graphViewPage.waitForGraphToLoad(10000);

      // Verify graph container is visible
      const isVisible = await graphViewPage.isGraphVisible();
      expect(isVisible).toBe(true);
    });

    test('should not have console errors', async ({ page, graphViewPage }) => {
      const consoleErrors: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait for graph to load
      await graphViewPage.waitForGraphToLoad(10000);

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
    test('should have navigation to Routes view', async ({ page, graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad(10000);

      // Find and click Routes link
      const routesLink = page.locator('a[href*="/routes"]').first();
      await routesLink.waitFor({ state: 'visible', timeout: 5000 });
      await routesLink.click();

      // Verify navigation
      await page.waitForURL(/\#\/routes/, { timeout: 5000 });
      expect(page.url()).toContain('#/routes');
    });
  });
});

