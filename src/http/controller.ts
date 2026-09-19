/**
 * REST endpoints controller
 *
 * All endpoints are served under the /graph-studio base path.
 */

import { Controller, Get, Req, Res, Inject, All, Optional } from '@nestjs/common';
import { SnapshotCollector } from '../snapshot/collector';
import { GraphQLOperationCollector } from '../snapshot/graphql-collector';
import { GraphAnalyzer } from '../analysis/analyzer';
import { serveStatic } from './static';

@Controller('graph-studio')
export class GraphStudioController {
  constructor(
    @Inject(SnapshotCollector) private readonly collector: SnapshotCollector,
    @Inject(GraphAnalyzer) private readonly analyzer: GraphAnalyzer,
    // Optional: GraphStudioModule always registers this provider today, but
    // treating it as optional keeps getIssues() from hard-failing DI if that
    // ever changes, degrading gracefully to REST-only analysis instead.
    @Optional() @Inject(GraphQLOperationCollector) private readonly graphqlCollector?: GraphQLOperationCollector,
  ) {}

  @Get('graph')
  getGraph() {
    return this.collector.collect();
  }

  @Get('routes')
  getRoutes() {
    const snapshot = this.collector.collect();
    return {
      routes: snapshot.routes,
      stats: snapshot.stats,
    };
  }

  @Get('issues')
  getIssues() {
    const snapshot = this.collector.collect();
    const graphqlSnapshot = this.graphqlCollector?.collect();
    return this.analyzer.analyze(snapshot, graphqlSnapshot);
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Serve UI root (handles /graph-studio without trailing slash)
  @Get()
  serveUiRoot(@Req() req: any, @Res() res: any) {
    const handled = serveStatic(req, res, '/graph-studio');
    if (!handled) {
      res.status(404).send('Not Found');
    }
  }

  // Serve UI catch-all for SPA routing (handles /graph-studio/* with trailing slash)
  @All('*')
  serveUi(@Req() req: any, @Res() res: any) {
    const handled = serveStatic(req, res, '/graph-studio');
    if (!handled) {
      res.status(404).send('Not Found');
    }
  }
}

