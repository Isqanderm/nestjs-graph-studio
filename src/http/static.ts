/**
 * Static UI file serving with SPA fallback
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

// Try to find UI directory - check both built and source locations
function findUiDir(): string {
  // When running from built package (dist/)
  const builtUiDir = join(__dirname, '..', 'ui');
  if (existsSync(join(builtUiDir, 'index.html'))) {
    return builtUiDir;
  }

  // When running from source with ts-node, check dist/ui first (built UI)
  const distUiDir = join(__dirname, '..', '..', 'dist', 'ui');
  if (existsSync(join(distUiDir, 'index.html'))) {
    return distUiDir;
  }

  // Fallback to source UI directory (for development)
  const sourceUiDir = join(__dirname, '..', '..', 'ui', 'dist');
  if (existsSync(join(sourceUiDir, 'index.html'))) {
    return sourceUiDir;
  }

  // Final fallback to built location
  return builtUiDir;
}

const UI_DIR = findUiDir();

/**
 * Get MIME type for file extension
 */
function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Serve static file or SPA fallback
 */
export function serveStatic(req: any, res: any, basePath: string): boolean {
  // Remove basePath from URL
  let requestPath = req.url || req.path || '';
  if (requestPath.startsWith(basePath)) {
    requestPath = requestPath.substring(basePath.length);
  }

  // Remove query string
  requestPath = requestPath.split('?')[0];

  // Default to index.html
  if (requestPath === '' || requestPath === '/') {
    requestPath = '/index.html';
  }

  // Security: prevent directory traversal
  if (requestPath.includes('..')) {
    res.status(403).send('Forbidden');
    return true;
  }

  const filePath = join(UI_DIR, requestPath);

  // Try to read the file directly without checking existence first
  // This avoids TOCTOU (time-of-check-time-of-use) race conditions
  try {
    const content = readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(content);
    return true;
  } catch (error) {
    // File doesn't exist, can't be read, or is a directory - fall through to SPA fallback
    // Only log actual errors (not ENOENT or EISDIR)
    const errorCode = (error as any).code;
    if (errorCode !== 'ENOENT' && errorCode !== 'EISDIR') {
      console.error('Error serving static file:', error);
    }
    // Fall through to SPA fallback
  }

  // SPA fallback: serve index.html for non-API routes
  if (req.method === 'GET' && !requestPath.startsWith('/api')) {
    const indexPath = join(UI_DIR, 'index.html');
    try {
      const content = readFileSync(indexPath);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(content);
      return true;
    } catch (error) {
      // Index.html doesn't exist or can't be read
      // Only log actual errors (not ENOENT)
      if ((error as any).code !== 'ENOENT') {
        console.error('Error serving index.html:', error);
      }
      return false;
    }
  }

  return false;
}

/**
 * Create middleware for serving static files
 */
export function createStaticMiddleware(basePath: string) {
  return (req: any, res: any, next: any) => {
    // Only handle requests under basePath
    const url = req.url || req.path || '';
    if (!url.startsWith(basePath)) {
      return next();
    }

    // Try to serve static file
    const handled = serveStatic(req, res, basePath);
    if (!handled) {
      next();
    }
  };
}

