import { describe, it, expect } from 'vitest';
import { redactPayload, samplePayload } from '../security/redact';

describe('redactPayload', () => {
  it('should redact sensitive fields by exact match', () => {
    const input = {
      username: 'john',
      password: 'secret123',
      email: 'john@example.com',
    };

    const result = redactPayload(input, {
      patterns: ['password'],
      maxSize: 1000,
    });

    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('john');
    expect(result.email).toBe('john@example.com');
  });

  it('should redact fields matching regex patterns', () => {
    const input = {
      apiKey: 'abc123',
      api_token: 'xyz789',
      userPassword: 'secret',
      normalField: 'value',
    };

    const result = redactPayload(input, {
      patterns: [/password/i, /token/i, /key/i],
      maxSize: 1000,
    });

    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.api_token).toBe('[REDACTED]');
    expect(result.userPassword).toBe('[REDACTED]');
    expect(result.normalField).toBe('value');
  });

  it('should redact nested fields using dot notation', () => {
    const input = {
      headers: {
        authorization: 'Bearer token123',
        'content-type': 'application/json',
      },
      body: {
        data: 'test',
      },
    };

    const result = redactPayload(input, {
      patterns: ['headers.authorization'],
      maxSize: 1000,
    });

    expect(result.headers.authorization).toBe('[REDACTED]');
    expect(result.headers['content-type']).toBe('application/json');
    expect(result.body.data).toBe('test');
  });

  it('should truncate long strings', () => {
    const input = {
      longString: 'a'.repeat(100),
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 50,
    });

    expect(result.longString).toContain('[TRUNCATED]');
    expect(result.longString.length).toBeLessThan(100);
  });

  it('should truncate large arrays', () => {
    const input = {
      items: Array(150).fill('item'),
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 1000,
    });

    expect(result.items.length).toBe(101); // 100 items + [TRUNCATED]
    expect(result.items[100]).toBe('[TRUNCATED]');
  });

  it('should handle null and undefined', () => {
    const input = {
      nullValue: null,
      undefinedValue: undefined,
      normalValue: 'test',
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 1000,
    });

    expect(result.nullValue).toBeNull();
    expect(result.undefinedValue).toBeUndefined();
    expect(result.normalValue).toBe('test');
  });
});

describe('samplePayload', () => {
  it('should redact and sample payload', () => {
    const input = {
      username: 'john',
      password: 'secret',
    };

    const result = samplePayload(input, [/password/i], 1000);

    expect(result.username).toBe('john');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should truncate very large payloads', () => {
    const input = {
      data: 'x'.repeat(10000),
    };

    const result = samplePayload(input, [], 100);

    // The payload is truncated during redaction, not at the top level
    expect(result.data).toContain('[TRUNCATED]');
  });

  it('should handle non-serializable objects', () => {
    const circular: any = { name: 'test' };
    circular.self = circular;

    const result = samplePayload(circular, [], 1000);

    expect(result._error).toBeDefined();
  });

  it('should handle empty objects', () => {
    const result = samplePayload({}, [], 1000);

    expect(result).toEqual({});
  });

  it('should handle empty arrays', () => {
    const result = samplePayload([], [], 1000);

    expect(result).toEqual([]);
  });

  it('should handle primitive values', () => {
    expect(samplePayload('string', [], 1000)).toBe('string');
    expect(samplePayload(123, [], 1000)).toBe(123);
    expect(samplePayload(true, [], 1000)).toBe(true);
    expect(samplePayload(null, [], 1000)).toBeNull();
  });
});

describe('redactPayload - Advanced Cases', () => {
  it('should redact deeply nested fields', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            password: 'secret',
            data: 'public',
          },
        },
      },
    };

    const result = redactPayload(input, {
      patterns: [/password/i],
      maxSize: 1000,
    });

    expect(result.level1.level2.level3.password).toBe('[REDACTED]');
    expect(result.level1.level2.level3.data).toBe('public');
  });

  it('should redact fields in arrays of objects', () => {
    const input = {
      users: [
        { name: 'Alice', password: 'secret1' },
        { name: 'Bob', password: 'secret2' },
      ],
    };

    const result = redactPayload(input, {
      patterns: [/password/i],
      maxSize: 1000,
    });

    expect(result.users[0].password).toBe('[REDACTED]');
    expect(result.users[1].password).toBe('[REDACTED]');
    expect(result.users[0].name).toBe('Alice');
    expect(result.users[1].name).toBe('Bob');
  });

  it('should handle multiple dot-notation patterns', () => {
    const input = {
      headers: {
        authorization: 'Bearer token',
        cookie: 'session=abc',
        'content-type': 'application/json',
      },
      body: {
        secret: 'hidden',
        data: 'visible',
      },
    };

    const result = redactPayload(input, {
      patterns: ['headers.authorization', 'headers.cookie', 'body.secret'],
      maxSize: 1000,
    });

    expect(result.headers.authorization).toBe('[REDACTED]');
    expect(result.headers.cookie).toBe('[REDACTED]');
    expect(result.body.secret).toBe('[REDACTED]');
    expect(result.headers['content-type']).toBe('application/json');
    expect(result.body.data).toBe('visible');
  });

  it('should handle mixed pattern types (string and regex)', () => {
    const input = {
      apiKey: 'key123',
      password: 'secret',
      headers: {
        authorization: 'Bearer token',
      },
      normalField: 'value',
    };

    const result = redactPayload(input, {
      patterns: ['headers.authorization', /password/i, /key/i],
      maxSize: 1000,
    });

    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.password).toBe('[REDACTED]');
    expect(result.headers.authorization).toBe('[REDACTED]');
    expect(result.normalField).toBe('value');
  });

  it('should handle case-insensitive regex patterns', () => {
    const input = {
      PASSWORD: 'secret1',
      Password: 'secret2',
      password: 'secret3',
      pass: 'visible',
    };

    const result = redactPayload(input, {
      patterns: [/^password$/i],
      maxSize: 1000,
    });

    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Password).toBe('[REDACTED]');
    expect(result.password).toBe('[REDACTED]');
    expect(result.pass).toBe('visible'); // Doesn't match exact pattern
  });

  it('should preserve object structure when redacting', () => {
    const input = {
      user: {
        id: 123,
        credentials: {
          password: 'secret',
          apiKey: 'key123',
        },
        profile: {
          name: 'John',
        },
      },
    };

    const result = redactPayload(input, {
      patterns: [/password/i, /key/i],
      maxSize: 1000,
    });

    expect(result.user.id).toBe(123);
    expect(result.user.credentials.password).toBe('[REDACTED]');
    expect(result.user.credentials.apiKey).toBe('[REDACTED]');
    expect(result.user.profile.name).toBe('John');
  });

  it('should convert Date objects to plain objects during redaction', () => {
    const date = new Date('2024-01-01');
    const input = {
      timestamp: date,
      data: 'test',
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 1000,
    });

    // Date objects are converted to plain objects during JSON parse/stringify
    expect(typeof result.timestamp).toBe('object');
    expect(result.data).toBe('test');
  });

  it('should convert Buffer objects during redaction', () => {
    const buffer = Buffer.from('test data');
    const input = {
      file: buffer,
      name: 'test.txt',
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 1000,
    });

    // Buffer is converted to object with type and data properties during JSON serialization
    expect(typeof result.file).toBe('object');
    expect(result.name).toBe('test.txt');
  });

  it('should truncate nested long strings', () => {
    const input = {
      outer: {
        inner: {
          longText: 'a'.repeat(200),
        },
      },
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 50,
    });

    expect(result.outer.inner.longText).toContain('[TRUNCATED]');
    expect(result.outer.inner.longText.length).toBeLessThan(200);
  });

  it('should handle empty pattern array', () => {
    const input = {
      password: 'secret',
      data: 'public',
    };

    const result = redactPayload(input, {
      patterns: [],
      maxSize: 1000,
    });

    expect(result.password).toBe('secret');
    expect(result.data).toBe('public');
  });

  it('should handle objects with numeric keys', () => {
    const input = {
      0: 'first',
      1: 'second',
      password: 'secret',
    };

    const result = redactPayload(input, {
      patterns: [/password/i],
      maxSize: 1000,
    });

    expect(result[0]).toBe('first');
    expect(result[1]).toBe('second');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should not preserve symbol keys (JSON serialization limitation)', () => {
    const sym = Symbol('test');
    const input = {
      [sym]: 'symbol value',
      password: 'secret',
      data: 'public',
    };

    const result = redactPayload(input, {
      patterns: [/password/i],
      maxSize: 1000,
    });

    // Symbol keys are not preserved during JSON serialization
    expect(result[sym]).toBeUndefined();
    expect(result.password).toBe('[REDACTED]');
    expect(result.data).toBe('public');
  });
});

