/**
 * Express adapter utilities for SSE
 */

export function setSseHeaders(res: any): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders?.();
}

export function writeSseEvent(res: any, event: any): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function writeSseComment(res: any, comment: string): void {
  res.write(`: ${comment}\n\n`);
}

export function isExpress(app: any): boolean {
  return app && typeof app.use === 'function' && app._router !== undefined;
}

