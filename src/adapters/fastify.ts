/**
 * Fastify adapter utilities for SSE
 */

export function setSseHeaders(reply: any): void {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no');
}

export function writeSseEvent(reply: any, event: any): void {
  reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function writeSseComment(reply: any, comment: string): void {
  reply.raw.write(`: ${comment}\n\n`);
}

export function isFastify(app: any): boolean {
  return !!(app && typeof app.register === 'function' && app.version !== undefined);
}

