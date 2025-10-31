import { test, expect } from './fixtures/base';

/**
 * E2E tests for RoutesView component
 * Tests the routes table and filtering
 */
test.describe('RoutesView E2E', () => {
  test.beforeEach(async ({ routesViewPage }) => {
    await routesViewPage.goto();
  });

  test.describe('Initial Rendering', () => {
    test('should render the routes table', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      expect(await routesViewPage.routesTable.isVisible()).toBe(true);
    });

    test('should display search input', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      expect(await routesViewPage.searchInput.isVisible()).toBe(true);
    });

    test('should display routes', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      const routeCount = await routesViewPage.getRouteCount();
      expect(typeof routeCount).toBe('number');
      expect(routeCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Route Filtering', () => {
    test('should allow searching routes', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      await routesViewPage.search('api');
      const searchValue = await routesViewPage.searchInput.inputValue();
      expect(searchValue).toBe('api');
    });

    test('should clear search', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      await routesViewPage.search('test');
      await routesViewPage.clearSearch();
      
      const searchValue = await routesViewPage.searchInput.inputValue();
      expect(searchValue).toBe('');
    });

    test('should handle empty search', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      await routesViewPage.search('');
      const routeCount = await routesViewPage.getRouteCount();
      expect(typeof routeCount).toBe('number');
    });
  });

  test.describe('Route Interaction', () => {
    test('should display route details', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      const routeCount = await routesViewPage.getRouteCount();
      if (routeCount > 0) {
        const details = await routesViewPage.getRouteDetails(0);
        expect(details.length).toBeGreaterThan(0);
      }
    });

    test('should handle clicking on routes', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      const routeCount = await routesViewPage.getRouteCount();
      if (routeCount > 0) {
        await routesViewPage.clickRoute(0);
        // Should not crash
        expect(await routesViewPage.routesTable.isVisible()).toBe(true);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to Graph view', async ({ routesViewPage, page }) => {
      await routesViewPage.waitForRoutes();
      
      const graphLink = page.locator('nav a:has-text("Graph"), [role="navigation"] a:has-text("Graph")');
      await graphLink.click();
      
      expect(page.url()).toMatch(/\/$|\/graph/);
    });

    test('should navigate to Live view', async ({ routesViewPage, page }) => {
      await routesViewPage.waitForRoutes();
      
      const liveLink = page.locator('nav a:has-text("Live"), [role="navigation"] a:has-text("Live")');
      await liveLink.click();
      
      expect(page.url()).toContain('/live');
    });
  });

  test.describe('Responsive Design', () => {
    test('should render on mobile viewport', async ({ routesViewPage, page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await routesViewPage.goto();
      await routesViewPage.waitForRoutes();
      
      expect(await routesViewPage.routesTable.isVisible()).toBe(true);
    });

    test('should render on tablet viewport', async ({ routesViewPage, page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await routesViewPage.goto();
      await routesViewPage.waitForRoutes();
      
      expect(await routesViewPage.routesTable.isVisible()).toBe(true);
    });

    test('should render on desktop viewport', async ({ routesViewPage, page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await routesViewPage.goto();
      await routesViewPage.waitForRoutes();
      
      expect(await routesViewPage.routesTable.isVisible()).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ routesViewPage }) => {
      const startTime = Date.now();
      
      await routesViewPage.goto();
      await routesViewPage.waitForRoutes();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle rapid search input changes', async ({ routesViewPage }) => {
      await routesViewPage.waitForRoutes();
      
      await routesViewPage.search('a');
      await routesViewPage.search('ab');
      await routesViewPage.search('abc');
      
      expect(await routesViewPage.routesTable.isVisible()).toBe(true);
    });
  });

  test.describe('Visual Regression', () => {
    test('should match routes view screenshot', async ({ routesViewPage, page }) => {
      await routesViewPage.waitForRoutes();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('routes-view.png', {
        maxDiffPixels: 100,
        timeout: 10000,
      });
    });
  });
});

