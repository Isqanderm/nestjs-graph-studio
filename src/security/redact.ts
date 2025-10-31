/**
 * Payload redaction and size limiting utilities
 */

export interface RedactionOptions {
  patterns: Array<string | RegExp>;
  maxSize: number;
}

const REDACTED = '[REDACTED]';
const TRUNCATED = '[TRUNCATED]';

/**
 * Check if a key matches any redaction pattern
 */
function shouldRedact(key: string, patterns: Array<string | RegExp>): boolean {
  return patterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return key === pattern || key.endsWith(`.${pattern}`);
    }
    return pattern.test(key);
  });
}

/**
 * Redact sensitive fields from an object
 */
export function redactPayload(
  obj: any,
  options: RedactionOptions,
  path = '',
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Primitive types
  if (typeof obj !== 'object') {
    if (typeof obj === 'string' && obj.length > options.maxSize) {
      return obj.substring(0, options.maxSize) + TRUNCATED;
    }
    return obj;
  }

  // Arrays
  if (Array.isArray(obj)) {
    if (obj.length > 100) {
      return [
        ...obj.slice(0, 100).map((item, i) => redactPayload(item, options, `${path}[${i}]`)),
        TRUNCATED,
      ];
    }
    return obj.map((item, i) => redactPayload(item, options, `${path}[${i}]`));
  }

  // Objects
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (shouldRedact(currentPath, options.patterns)) {
      result[key] = REDACTED;
    } else {
      result[key] = redactPayload(value, options, currentPath);
    }
  }

  return result;
}

/**
 * Create a safe sample of a payload
 */
export function samplePayload(
  payload: any,
  patterns: Array<string | RegExp>,
  maxSize: number,
): any {
  try {
    const redacted = redactPayload(payload, { patterns, maxSize });
    const json = JSON.stringify(redacted);
    
    if (json.length > maxSize * 2) {
      return {
        _truncated: true,
        _size: json.length,
        _preview: json.substring(0, maxSize),
      };
    }
    
    return redacted;
  } catch (error) {
    return {
      _error: 'Failed to serialize payload',
      _type: typeof payload,
    };
  }
}

