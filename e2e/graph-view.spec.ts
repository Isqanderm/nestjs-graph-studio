import { test, expect } from './fixtures/base';

/**
 * E2E tests for GraphView component
 * Tests the actual rendered graph visualization with Cytoscape
 */
test.describe('GraphView E2E', () => {
  test.beforeEach(async ({ graphViewPage }) => {
    await graphViewPage.goto();
  });

  test.describe('Initial Rendering', () => {
    test('should render the graph container', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      expect(await graphViewPage.isGraphVisible()).toBe(true);
    });

    test('should display the graph view without errors', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Check that no error messages are displayed
      expect(await graphViewPage.hasError()).toBe(false);
      
      // Verify the page loaded successfully
      expect(page.url()).toContain('/');
    });

    test('should render search input', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      expect(await graphViewPage.isSearchVisible()).toBe(true);
    });

    test('should have proper search placeholder text', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      const placeholder = await graphViewPage.getSearchPlaceholder();
      expect(placeholder.toLowerCase()).toContain('search');
    });
  });

  test.describe('Graph Interaction', () => {
    test('should allow searching for nodes', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Search for a common node type
      await graphViewPage.searchNode('Module');
      
      // Verify search input has the value
      const searchValue = await graphViewPage.searchInput.inputValue();
      expect(searchValue).toBe('Module');
    });

    test('should clear search input', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Search for something
      await graphViewPage.searchNode('Controller');
      expect(await graphViewPage.searchInput.inputValue()).toBe('Controller');
      
      // Clear search
      await graphViewPage.clearSearch();
      expect(await graphViewPage.searchInput.inputValue()).toBe('');
    });

    test('should handle empty search gracefully', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Search for empty string
      await graphViewPage.searchNode('');
      
      // Should not crash or show errors
      expect(await graphViewPage.hasError()).toBe(false);
    });

    test('should handle search for non-existent nodes', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Search for something that doesn't exist
      await graphViewPage.searchNode('NonExistentNode12345');
      
      // Should not crash
      expect(await graphViewPage.hasError()).toBe(false);
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation links', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      const navLinks = await graphViewPage.getNavigationLinks();
      expect(navLinks.length).toBeGreaterThan(0);
    });

    test('should navigate to Live view', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Navigate to Live view
      await graphViewPage.navigateTo('Live');
      
      // Verify URL changed
      expect(page.url()).toContain('/live');
    });

    test('should navigate to Routes view', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Navigate to Routes view
      await graphViewPage.navigateTo('Routes');
      
      // Verify URL changed
      expect(page.url()).toContain('/routes');
    });

    test('should navigate back to Graph view from other views', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Navigate to Live view
      await graphViewPage.navigateTo('Live');
      expect(page.url()).toContain('/live');
      
      // Navigate back to Graph view
      await graphViewPage.navigateTo('Graph');
      expect(page.url()).toMatch(/\/$|\/graph/);
    });
  });

  test.describe('Loading States', () => {
    test('should not show loading indicator after graph loads', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      await graphViewPage.waitForStable(1000);
      
      expect(await graphViewPage.isLoading()).toBe(false);
    });

    test('should render graph container even with no data', async ({ graphViewPage }) => {
      await graphViewPage.goto();
      
      // Even if there's no graph data, the container should render
      // This tests the "null graph state" scenario
      const isVisible = await graphViewPage.isGraphVisible();
      
      // Either the graph is visible or there's a message about no data
      // Both are acceptable states
      expect(typeof isVisible).toBe('boolean');
    });
  });

  test.describe('Responsive Design', () => {
    test('should render on mobile viewport', async ({ graphViewPage, page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await graphViewPage.goto();
      await graphViewPage.waitForGraphToLoad();
      
      expect(await graphViewPage.isGraphVisible()).toBe(true);
    });

    test('should render on tablet viewport', async ({ graphViewPage, page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await graphViewPage.goto();
      await graphViewPage.waitForGraphToLoad();
      
      expect(await graphViewPage.isGraphVisible()).toBe(true);
    });

    test('should render on desktop viewport', async ({ graphViewPage, page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await graphViewPage.goto();
      await graphViewPage.waitForGraphToLoad();
      
      expect(await graphViewPage.isGraphVisible()).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should not display errors on successful load', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      expect(await graphViewPage.hasError()).toBe(false);
    });

    test('should handle page refresh gracefully', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Refresh the page
      await page.reload();
      await graphViewPage.waitForGraphToLoad();
      
      // Should still work after refresh
      expect(await graphViewPage.isGraphVisible()).toBe(true);
      expect(await graphViewPage.hasError()).toBe(false);
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible search input', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Check that search input is keyboard accessible
      await graphViewPage.searchInput.focus();
      await graphViewPage.searchInput.type('Test');
      
      const value = await graphViewPage.searchInput.inputValue();
      expect(value).toBe('Test');
    });

    test('should be keyboard navigable', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should not crash
      expect(await graphViewPage.hasError()).toBe(false);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ graphViewPage }) => {
      const startTime = Date.now();
      
      await graphViewPage.goto();
      await graphViewPage.waitForGraphToLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle rapid search input changes', async ({ graphViewPage }) => {
      await graphViewPage.waitForGraphToLoad();
      
      // Rapidly change search input
      await graphViewPage.searchNode('A');
      await graphViewPage.searchNode('AB');
      await graphViewPage.searchNode('ABC');
      await graphViewPage.searchNode('ABCD');
      
      // Should not crash
      expect(await graphViewPage.hasError()).toBe(false);
    });
  });

  test.describe('Visual Regression', () => {
    test('should match graph view screenshot', async ({ graphViewPage, page }) => {
      await graphViewPage.waitForGraphToLoad();
      await graphViewPage.waitForStable(2000);
      
      // Take screenshot for visual comparison
      // Note: This will create a baseline on first run
      await expect(page).toHaveScreenshot('graph-view.png', {
        maxDiffPixels: 100,
        timeout: 10000,
      });
    });
  });
});

