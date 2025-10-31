/**
 * REST endpoints controller
 *
 * All endpoints are served under the /graph-studio base path.
 */

import { Controller, Get, Req, Res, Inject, All } from '@nestjs/common';
import { SnapshotCollector } from '../snapshot/collector';
import { serveStatic } from './static';

@Controller('graph-studio')
export class GraphStudioController {
  constructor(
    @Inject(SnapshotCollector) private readonly collector: SnapshotCollector,
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

