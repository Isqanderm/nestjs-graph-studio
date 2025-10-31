import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Custom pipe that sanitizes string inputs by trimming whitespace
 * and removing potentially dangerous characters.
 * This demonstrates a transformation pipe in the request lifecycle.
 *
 * ⚠️ WARNING: DEMONSTRATION CODE ONLY - NOT FOR PRODUCTION USE
 *
 * This sanitization implementation has known security vulnerabilities:
 * 1. Incomplete script tag sanitization (doesn't match </script > with spaces)
 * 2. Incomplete iframe tag sanitization (doesn't match </iframe > with spaces)
 * 3. Doesn't prevent all XSS attack vectors (e.g., event handlers, data URIs)
 * 4. Remote property injection vulnerability (user-controlled property names)
 *
 * For production use, please use a proper sanitization library such as:
 * - DOMPurify (https://github.com/cure53/DOMPurify)
 * - sanitize-html (https://github.com/apostrophecms/sanitize-html)
 * - class-validator with proper DTO validation
 *
 * This code is provided solely to demonstrate NestJS pipe functionality
 * in the context of the Graph Studio visualization tool.
 */
@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      // Trim whitespace
      let sanitized = value.trim();

      // Remove potentially dangerous characters (basic XSS prevention)
      // ⚠️ WARNING: This regex is incomplete and has known vulnerabilities
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

      return sanitized;
    }

    if (typeof value === 'object' && value !== null) {
      // Recursively sanitize object properties
      const sanitized: any = Array.isArray(value) ? [] : {};

      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          // ⚠️ WARNING: This allows user-controlled property names (remote property injection)
          sanitized[key] = this.transform(value[key]);
        }
      }

      return sanitized;
    }

    return value;
  }
}

