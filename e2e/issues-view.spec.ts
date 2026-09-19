import { test, expect } from './fixtures/base';

/**
 * IssuesView E2E Tests
 * Simple smoke tests to verify the Issues view loads and renders correctly
 */
test.describe('IssuesView E2E', () => {
  test.beforeEach(async ({ issuesViewPage }) => {
    await issuesViewPage.goto();
  });

  test.describe('Basic Rendering', () => {
    test('should load the page successfully', async ({ page }) => {
      expect(page.url()).toContain('/graph-studio');
      expect(page.url()).toContain('#/issues');

      await page.waitForLoadState('networkidle');
    });

    test('should render the issues summary bar', async ({ issuesViewPage }) => {
      await issuesViewPage.waitForSummary(10000);

      const isVisible = await issuesViewPage.summaryBar.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should not have console errors', async ({ page, issuesViewPage }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await issuesViewPage.waitForSummary(10000);
      await page.waitForTimeout(1000);

      const criticalErrors = consoleErrors.filter(
        (error) => !error.includes('Download the React DevTools')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation to Graph view', async ({ page, issuesViewPage }) => {
      await issuesViewPage.waitForSummary(10000);

      const graphLink = page.locator('nav a', { hasText: 'Graph' }).first();
      await graphLink.waitFor({ state: 'visible', timeout: 5000 });
      await graphLink.click();

      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/graph-studio');
      expect(page.url()).not.toContain('#/issues');
    });

    test('should be reachable from the sidebar Issues link', async ({ page, graphViewPage }) => {
      await graphViewPage.goto();
      await graphViewPage.verifyGraphViewLoaded();

      const issuesLink = page.locator('nav a', { hasText: 'Issues' }).first();
      await issuesLink.waitFor({ state: 'visible', timeout: 5000 });
      await issuesLink.click();

      await page.waitForTimeout(1000);
      expect(page.url()).toContain('#/issues');
    });
  });
});
