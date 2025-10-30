import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';

// Mock fs module BEFORE importing static module
vi.mock('fs', () => ({
  existsSync: vi.fn(() => false), // Default to false to avoid UI_DIR initialization issues
  readFileSync: vi.fn(),
  statSync: vi.fn(),
}));

import { serveStatic, createStaticMiddleware } from '../static';

describe('Static File Serving', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      url: '',
      path: '',
      method: 'GET',
    };

    mockRes = {
      setHeader: vi.fn(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });

  describe('serveStatic', () => {
    describe('security', () => {
      it('should prevent directory traversal attacks', () => {
        mockReq.url = '/graph-studio/../../../etc/passwd';

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.send).toHaveBeenCalledWith('Forbidden');
        expect(result).toBe(true);
      });

      it('should prevent directory traversal with encoded dots', () => {
        mockReq.url = '/graph-studio/..%2F..%2Fetc%2Fpasswd';

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.send).toHaveBeenCalledWith('Forbidden');
        expect(result).toBe(true);
      });
    });

    describe('file serving', () => {
      it('should serve index.html for root path', () => {
        mockReq.url = '/graph-studio/';
        const mockContent = Buffer.from('<html>Test</html>');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
        expect(mockRes.send).toHaveBeenCalledWith(mockContent);
        expect(result).toBe(true);
      });

      it('should serve index.html for empty path', () => {
        mockReq.url = '/graph-studio';
        const mockContent = Buffer.from('<html>Test</html>');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
        expect(result).toBe(true);
      });

      it('should serve CSS files with correct MIME type', () => {
        mockReq.url = '/graph-studio/styles.css';
        const mockContent = Buffer.from('body { color: red; }');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/css');
        expect(mockRes.send).toHaveBeenCalledWith(mockContent);
        expect(result).toBe(true);
      });

      it('should serve JavaScript files with correct MIME type', () => {
        mockReq.url = '/graph-studio/app.js';
        const mockContent = Buffer.from('console.log("test");');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/javascript');
        expect(result).toBe(true);
      });

      it('should serve JSON files with correct MIME type', () => {
        mockReq.url = '/graph-studio/data.json';
        const mockContent = Buffer.from('{"test": true}');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(result).toBe(true);
      });

      it('should serve image files with correct MIME types', () => {
        const imageTypes = [
          { ext: 'png', mime: 'image/png' },
          { ext: 'jpg', mime: 'image/jpeg' },
          { ext: 'jpeg', mime: 'image/jpeg' },
          { ext: 'gif', mime: 'image/gif' },
          { ext: 'svg', mime: 'image/svg+xml' },
          { ext: 'ico', mime: 'image/x-icon' },
        ];

        imageTypes.forEach(({ ext, mime }) => {
          vi.clearAllMocks();
          mockReq.url = `/graph-studio/image.${ext}`;
          const mockContent = Buffer.from('image data');

          vi.mocked(fs.existsSync).mockReturnValue(true);
          vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
          vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

          serveStatic(mockReq, mockRes, '/graph-studio');

          expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', mime);
        });
      });

      it('should serve font files with correct MIME types', () => {
        const fontTypes = [
          { ext: 'woff', mime: 'font/woff' },
          { ext: 'woff2', mime: 'font/woff2' },
          { ext: 'ttf', mime: 'font/ttf' },
          { ext: 'eot', mime: 'application/vnd.ms-fontobject' },
        ];

        fontTypes.forEach(({ ext, mime }) => {
          vi.clearAllMocks();
          mockReq.url = `/graph-studio/font.${ext}`;
          const mockContent = Buffer.from('font data');

          vi.mocked(fs.existsSync).mockReturnValue(true);
          vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
          vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

          serveStatic(mockReq, mockRes, '/graph-studio');

          expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', mime);
        });
      });

      it('should use default MIME type for unknown extensions', () => {
        mockReq.url = '/graph-studio/file.unknown';
        const mockContent = Buffer.from('unknown content');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
        expect(result).toBe(true);
      });

      it('should strip query strings from URLs', () => {
        mockReq.url = '/graph-studio/app.js?v=123';
        const mockContent = Buffer.from('console.log("test");');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/javascript');
        expect(result).toBe(true);
      });

      it('should handle file read errors', () => {
        mockReq.url = '/graph-studio/error.js';

        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockImplementation(() => {
          const error: any = new Error('Read error');
          error.code = 'EACCES'; // Not ENOENT, so it should be logged
          throw error;
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        // With the new implementation, read errors return false (file not served)
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('SPA fallback', () => {
      it('should serve index.html for non-existent routes (SPA fallback)', () => {
        mockReq.url = '/graph-studio/some/route';
        mockReq.method = 'GET';
        const mockContent = Buffer.from('<html>SPA</html>');

        // First call to readFileSync for the requested file (throws ENOENT)
        // Second call to readFileSync for index.html (succeeds)
        vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
          const error: any = new Error('File not found');
          error.code = 'ENOENT';
          throw error;
        }).mockReturnValueOnce(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
        expect(mockRes.send).toHaveBeenCalledWith(mockContent);
        expect(result).toBe(true);
      });

      it('should not serve SPA fallback for API routes', () => {
        mockReq.url = '/graph-studio/api/data';
        mockReq.method = 'GET';

        vi.mocked(fs.readFileSync).mockImplementation(() => {
          const error: any = new Error('File not found');
          error.code = 'ENOENT';
          throw error;
        });

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(result).toBe(false);
      });

      it('should not serve SPA fallback for POST requests', () => {
        mockReq.url = '/graph-studio/some/route';
        mockReq.method = 'POST';

        vi.mocked(fs.readFileSync).mockImplementation(() => {
          const error: any = new Error('File not found');
          error.code = 'ENOENT';
          throw error;
        });

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(result).toBe(false);
      });

      it('should handle index.html read errors in SPA fallback', () => {
        mockReq.url = '/graph-studio/some/route';
        mockReq.method = 'GET';

        // Both readFileSync calls throw errors
        vi.mocked(fs.readFileSync).mockImplementation(() => {
          const error: any = new Error('Read error');
          error.code = 'EACCES'; // Not ENOENT, so it should be logged
          throw error;
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('path handling', () => {
      it('should handle req.path instead of req.url', () => {
        mockReq.url = undefined;
        mockReq.path = '/graph-studio/app.js';
        const mockContent = Buffer.from('console.log("test");');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(result).toBe(true);
      });

      it('should handle missing url and path', () => {
        mockReq.url = undefined;
        mockReq.path = undefined;
        const mockContent = Buffer.from('<html>Test</html>');

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const result = serveStatic(mockReq, mockRes, '/graph-studio');

        expect(result).toBe(true);
      });
    });
  });

  describe('createStaticMiddleware', () => {
    let next: any;

    beforeEach(() => {
      next = vi.fn();
    });

    it('should call next() for URLs not under basePath', () => {
      const middleware = createStaticMiddleware('/graph-studio');
      mockReq.url = '/other/path';

      middleware(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle static files under basePath', () => {
      const middleware = createStaticMiddleware('/graph-studio');
      mockReq.url = '/graph-studio/app.js';
      const mockContent = Buffer.from('console.log("test");');

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      middleware(mockReq, mockRes, next);

      expect(mockRes.send).toHaveBeenCalledWith(mockContent);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when file is not handled', () => {
      const middleware = createStaticMiddleware('/graph-studio');
      mockReq.url = '/graph-studio/api/data';
      mockReq.method = 'POST';

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        const error: any = new Error('File not found');
        error.code = 'ENOENT';
        throw error;
      });

      middleware(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should use req.path if req.url is not available', () => {
      const middleware = createStaticMiddleware('/graph-studio');
      mockReq.url = undefined;
      mockReq.path = '/other/path';

      middleware(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

