import { test as base, expect } from '@playwright/test';
import { GraphViewPage } from '../pages/GraphViewPage';
import { RoutesViewPage } from '../pages/RoutesViewPage';

/**
 * Extended test fixtures with page objects for Graph Studio
 */
type GraphStudioFixtures = {
  graphViewPage: GraphViewPage;
  routesViewPage: RoutesViewPage;
};

/**
 * Custom test with Graph Studio page objects
 */
export const test = base.extend<GraphStudioFixtures>({
  graphViewPage: async ({ page }, use) => {
    const graphViewPage = new GraphViewPage(page);
    await use(graphViewPage);
  },

  routesViewPage: async ({ page }, use) => {
    const routesViewPage = new RoutesViewPage(page);
    await use(routesViewPage);
  },
});

export { expect };

