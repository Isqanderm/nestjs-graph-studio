import { describe, it, expect, vi } from 'vitest';
import { setSseHeaders, writeSseEvent, writeSseComment, isExpress } from '../express';

describe('Express Adapter', () => {
  describe('setSseHeaders', () => {
    it('should set all required SSE headers', () => {
      const mockRes = {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
      };

      setSseHeaders(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');
      expect(mockRes.setHeader).toHaveBeenCalledTimes(4);
      expect(mockRes.flushHeaders).toHaveBeenCalled();
    });

    it('should work without flushHeaders method', () => {
      const mockRes = {
        setHeader: vi.fn(),
      };

      setSseHeaders(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledTimes(4);
    });

    it('should work with different response objects', () => {
      const mockRes = {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
      };

      setSseHeaders(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalled();
    });
  });

  describe('writeSseEvent', () => {
    it('should write event data in SSE format', () => {
      const mockRes = {
        write: vi.fn(),
      };

      const event = { type: 'test', data: 'hello' };
      writeSseEvent(mockRes, event);

      expect(mockRes.write).toHaveBeenCalledWith('data: {"type":"test","data":"hello"}\n\n');
    });

    it('should handle simple string events', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseEvent(mockRes, 'simple event');

      expect(mockRes.write).toHaveBeenCalledWith('data: "simple event"\n\n');
    });

    it('should handle complex nested objects', () => {
      const mockRes = {
        write: vi.fn(),
      };

      const event = {
        type: 'complex',
        nested: {
          data: [1, 2, 3],
          meta: { timestamp: 123 },
        },
      };

      writeSseEvent(mockRes, event);

      expect(mockRes.write).toHaveBeenCalledWith(
        'data: {"type":"complex","nested":{"data":[1,2,3],"meta":{"timestamp":123}}}\n\n'
      );
    });

    it('should handle null and undefined', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseEvent(mockRes, null);
      expect(mockRes.write).toHaveBeenCalledWith('data: null\n\n');

      writeSseEvent(mockRes, undefined);
      expect(mockRes.write).toHaveBeenCalledWith('data: undefined\n\n');
    });

    it('should handle arrays', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseEvent(mockRes, [1, 2, 3]);

      expect(mockRes.write).toHaveBeenCalledWith('data: [1,2,3]\n\n');
    });
  });

  describe('writeSseComment', () => {
    it('should write comment in SSE format', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseComment(mockRes, 'This is a comment');

      expect(mockRes.write).toHaveBeenCalledWith(': This is a comment\n\n');
    });

    it('should handle empty comments', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseComment(mockRes, '');

      expect(mockRes.write).toHaveBeenCalledWith(': \n\n');
    });

    it('should handle multi-line comments', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseComment(mockRes, 'Line 1\nLine 2');

      expect(mockRes.write).toHaveBeenCalledWith(': Line 1\nLine 2\n\n');
    });

    it('should handle special characters', () => {
      const mockRes = {
        write: vi.fn(),
      };

      writeSseComment(mockRes, 'Comment with special chars: @#$%^&*()');

      expect(mockRes.write).toHaveBeenCalledWith(': Comment with special chars: @#$%^&*()\n\n');
    });
  });

  describe('isExpress', () => {
    it('should return true for Express app', () => {
      const mockExpressApp = {
        use: vi.fn(),
        _router: {},
      };

      expect(isExpress(mockExpressApp)).toBe(true);
    });

    it('should return false for Fastify app', () => {
      const mockFastifyApp = {
        register: vi.fn(),
        // No _router property
      };

      expect(isExpress(mockFastifyApp)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isExpress(null)).toBeFalsy();
    });

    it('should return false for undefined', () => {
      expect(isExpress(undefined)).toBeFalsy();
    });

    it('should return false for object without use method', () => {
      const mockApp = {
        _router: {},
      };

      expect(isExpress(mockApp)).toBe(false);
    });

    it('should return false for object without _router property', () => {
      const mockApp = {
        use: vi.fn(),
      };

      expect(isExpress(mockApp)).toBe(false);
    });

    it('should return false for object with use but not a function', () => {
      const mockApp = {
        use: 'not a function',
        _router: {},
      };

      expect(isExpress(mockApp)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isExpress({})).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isExpress('string')).toBe(false);
      expect(isExpress(123)).toBe(false);
      expect(isExpress(true)).toBe(false);
    });
  });
});

