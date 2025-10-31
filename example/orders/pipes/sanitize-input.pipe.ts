import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Custom pipe that sanitizes string inputs by trimming whitespace
 * and removing potentially dangerous HTML tags.
 * This demonstrates a transformation pipe in the request lifecycle.
 *
 * Security improvements:
 * 1. Uses iterative replacement to prevent incomplete sanitization
 * 2. Removes all < and > characters to prevent HTML injection
 * 3. Prevents remote property injection by using a whitelist approach
 *
 * For production use, consider using a proper sanitization library such as:
 * - DOMPurify (https://github.com/cure53/DOMPurify)
 * - sanitize-html (https://github.com/apostrophecms/sanitize-html)
 * - class-validator with proper DTO validation
 *
 * This code is provided to demonstrate NestJS pipe functionality
 * in the context of the Graph Studio visualization tool.
 */
@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  /**
   * Whitelist of allowed property names for object sanitization.
   * This prevents remote property injection attacks.
   */
  private readonly ALLOWED_PROPERTIES = new Set([
    'name',
    'description',
    'quantity',
    'price',
    'status',
    'items',
    'userId',
    'email',
    'username',
  ]);

  transform(value: any): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  /**
   * Sanitizes a string by removing all HTML tags.
   * Uses iterative replacement to prevent incomplete sanitization.
   */
  private sanitizeString(value: string): string {
    // Trim whitespace
    let sanitized = value.trim();

    // Remove all < and > characters to prevent any HTML injection
    // This is more secure than trying to match specific tags
    sanitized = sanitized.replace(/[<>]/g, '');

    return sanitized;
  }

  /**
   * Sanitizes an object by only allowing whitelisted properties.
   * This prevents remote property injection attacks.
   */
  private sanitizeObject(value: any): any {
    const sanitized: any = Array.isArray(value) ? [] : {};

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        // Only process whitelisted properties to prevent prototype pollution
        if (Array.isArray(value) || this.ALLOWED_PROPERTIES.has(key)) {
          // Prefix with $ to prevent __proto__ and other dangerous properties
          const safeKey = Array.isArray(value) ? key : `$${key}`;
          sanitized[safeKey] = this.transform(value[key]);
        }
      }
    }

    return sanitized;
  }
}

