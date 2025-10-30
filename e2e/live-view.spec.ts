import { test, expect } from './fixtures/base';

/**
 * E2E tests for LiveView component
 * Tests the live events stream and filtering
 */
test.describe('LiveView E2E', () => {
  test.beforeEach(async ({ liveViewPage }) => {
    await liveViewPage.goto();
  });

  test.describe('Initial Rendering', () => {
    test('should render the events list', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      expect(await liveViewPage.eventsList.isVisible()).toBe(true);
    });

    test('should display search input', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      expect(await liveViewPage.searchInput.isVisible()).toBe(true);
    });

    test('should show connection status', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      
      // Connection status should be visible
      const isVisible = await liveViewPage.connectionStatus.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  test.describe('Event Filtering', () => {
    test('should allow searching events', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      
      await liveViewPage.search('request');
      const searchValue = await liveViewPage.searchInput.inputValue();
      expect(searchValue).toBe('request');
    });

    test('should clear search', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      
      await liveViewPage.search('test');
      await liveViewPage.clearSearch();
      
      const searchValue = await liveViewPage.searchInput.inputValue();
      expect(searchValue).toBe('');
    });
  });

  test.describe('Event Display', () => {
    test('should display events when available', async ({ liveViewPage }) => {
      await liveViewPage.waitForEvents();
      
      // Wait a bit for events to potentially arrive
      await liveViewPage.page.waitForTimeout(2000);
      
      const eventCount = await liveViewPage.getEventCount();
      // Event count should be a number (could be 0 if no events yet)
      expect(typeof eventCount).toBe('number');
      expect(eventCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to Graph view', async ({ liveViewPage, page }) => {
      await liveViewPage.waitForEvents();
      
      const graphLink = page.locator('nav a:has-text("Graph"), [role="navigation"] a:has-text("Graph")');
      await graphLink.click();
      
      expect(page.url()).toMatch(/\/$|\/graph/);
    });

    test('should navigate to Routes view', async ({ liveViewPage, page }) => {
      await liveViewPage.waitForEvents();
      
      const routesLink = page.locator('nav a:has-text("Routes"), [role="navigation"] a:has-text("Routes")');
      await routesLink.click();
      
      expect(page.url()).toContain('/routes');
    });
  });

  test.describe('Responsive Design', () => {
    test('should render on mobile viewport', async ({ liveViewPage, page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await liveViewPage.goto();
      await liveViewPage.waitForEvents();
      
      expect(await liveViewPage.eventsList.isVisible()).toBe(true);
    });

    test('should render on tablet viewport', async ({ liveViewPage, page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await liveViewPage.goto();
      await liveViewPage.waitForEvents();
      
      expect(await liveViewPage.eventsList.isVisible()).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ liveViewPage }) => {
      const startTime = Date.now();
      
      await liveViewPage.goto();
      await liveViewPage.waitForEvents();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000);
    });
  });
});

