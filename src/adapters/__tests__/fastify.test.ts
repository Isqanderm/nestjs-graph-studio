import { describe, it, expect, vi } from 'vitest';
import { setSseHeaders, writeSseEvent, writeSseComment, isFastify } from '../fastify';

describe('Fastify Adapter', () => {
  describe('setSseHeaders', () => {
    it('should set all required SSE headers', () => {
      const mockReply = {
        raw: {
          setHeader: vi.fn(),
        },
      };

      setSseHeaders(mockReply);

      expect(mockReply.raw.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockReply.raw.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockReply.raw.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockReply.raw.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');
      expect(mockReply.raw.setHeader).toHaveBeenCalledTimes(4);
    });

    it('should work with different reply objects', () => {
      const mockReply = {
        raw: {
          setHeader: vi.fn(),
        },
      };

      setSseHeaders(mockReply);

      expect(mockReply.raw.setHeader).toHaveBeenCalled();
    });
  });

  describe('writeSseEvent', () => {
    it('should write event data in SSE format', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      const event = { type: 'test', data: 'hello' };
      writeSseEvent(mockReply, event);

      expect(mockReply.raw.write).toHaveBeenCalledWith('data: {"type":"test","data":"hello"}\n\n');
    });

    it('should handle simple string events', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseEvent(mockReply, 'simple message');

      expect(mockReply.raw.write).toHaveBeenCalledWith('data: "simple message"\n\n');
    });

    it('should handle number events', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseEvent(mockReply, 42);

      expect(mockReply.raw.write).toHaveBeenCalledWith('data: 42\n\n');
    });

    it('should handle null events', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseEvent(mockReply, null);

      expect(mockReply.raw.write).toHaveBeenCalledWith('data: null\n\n');
    });

    it('should handle complex nested objects', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      const event = {
        type: 'complex',
        nested: {
          data: [1, 2, 3],
          meta: { timestamp: 123456 },
        },
      };

      writeSseEvent(mockReply, event);

      const expectedData = JSON.stringify(event);
      expect(mockReply.raw.write).toHaveBeenCalledWith(`data: ${expectedData}\n\n`);
    });

    it('should handle arrays', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      const event = [1, 2, 3, 'test'];
      writeSseEvent(mockReply, event);

      expect(mockReply.raw.write).toHaveBeenCalledWith('data: [1,2,3,"test"]\n\n');
    });
  });

  describe('writeSseComment', () => {
    it('should write comment in SSE format', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseComment(mockReply, 'This is a comment');

      expect(mockReply.raw.write).toHaveBeenCalledWith(': This is a comment\n\n');
    });

    it('should handle empty comments', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseComment(mockReply, '');

      expect(mockReply.raw.write).toHaveBeenCalledWith(': \n\n');
    });

    it('should handle multi-line comments', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseComment(mockReply, 'Line 1\nLine 2');

      expect(mockReply.raw.write).toHaveBeenCalledWith(': Line 1\nLine 2\n\n');
    });

    it('should handle special characters in comments', () => {
      const mockReply = {
        raw: {
          write: vi.fn(),
        },
      };

      writeSseComment(mockReply, 'Comment with: colons and "quotes"');

      expect(mockReply.raw.write).toHaveBeenCalledWith(': Comment with: colons and "quotes"\n\n');
    });
  });

  describe('isFastify', () => {
    it('should return true for Fastify app', () => {
      const fastifyApp = {
        register: vi.fn(),
        version: '4.0.0',
      };

      expect(isFastify(fastifyApp)).toBe(true);
    });

    it('should return false for Express app', () => {
      const expressApp = {
        use: vi.fn(),
        get: vi.fn(),
      };

      expect(isFastify(expressApp)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isFastify(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFastify(undefined)).toBe(false);
    });

    it('should return false for object without register method', () => {
      const app = {
        version: '1.0.0',
      };

      expect(isFastify(app)).toBe(false);
    });

    it('should return false for object without version property', () => {
      const app = {
        register: vi.fn(),
      };

      expect(isFastify(app)).toBe(false);
    });

    it('should return false for object with register but not a function', () => {
      const app = {
        register: 'not a function',
        version: '1.0.0',
      };

      expect(isFastify(app)).toBe(false);
    });

    it('should return false for Fastify-like object with version undefined', () => {
      const app = {
        register: vi.fn(),
        version: undefined,
      };

      // version !== undefined check will fail
      expect(isFastify(app)).toBe(false);
    });

    it('should handle objects with only register method', () => {
      const app = {
        register: vi.fn(),
      };

      expect(isFastify(app)).toBe(false);
    });
  });
});

