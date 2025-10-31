import { test as base, expect } from '@playwright/test';
import { GraphViewPage } from '../pages/GraphViewPage';
import { LiveViewPage } from '../pages/LiveViewPage';
import { RoutesViewPage } from '../pages/RoutesViewPage';

/**
 * Extended test fixtures with page objects for Graph Studio
 */
type GraphStudioFixtures = {
  graphViewPage: GraphViewPage;
  liveViewPage: LiveViewPage;
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
  
  liveViewPage: async ({ page }, use) => {
    const liveViewPage = new LiveViewPage(page);
    await use(liveViewPage);
  },
  
  routesViewPage: async ({ page }, use) => {
    const routesViewPage = new RoutesViewPage(page);
    await use(routesViewPage);
  },
});

export { expect };

