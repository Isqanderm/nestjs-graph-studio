import { describe, it, expect } from 'vitest';
import { serializeError } from '../models';

describe('Snapshot Models', () => {
  describe('serializeError', () => {
    it('should serialize a standard Error object', () => {
      const error = new Error('Test error message');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('Test error message');
      expect(serialized.stack).toBeDefined();
      expect(Array.isArray(serialized.stack)).toBe(true);
      expect(serialized.stack!.length).toBeLessThanOrEqual(10);
    });

    it('should serialize a custom error with name', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error message');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('CustomError');
      expect(serialized.message).toBe('Custom error message');
      expect(serialized.stack).toBeDefined();
    });

    it('should limit stack trace to 10 lines', () => {
      const error = new Error('Test error');
      // Create a deep stack trace
      const deepStack = Array.from({ length: 20 }, (_, i) => `  at line ${i}`).join('\n');
      error.stack = deepStack;

      const serialized = serializeError(error);

      expect(serialized.stack).toBeDefined();
      expect(serialized.stack!.length).toBe(10);
    });

    it('should handle error with cause', () => {
      const causeError = new Error('Cause error');
      const error = new Error('Main error');
      (error as any).cause = causeError;

      const serialized = serializeError(error);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('Main error');
      expect(serialized.cause).toBeDefined();
      expect(serialized.cause).toContain('Cause error');
    });

    it('should handle error with string cause', () => {
      const error = new Error('Main error');
      (error as any).cause = 'String cause';

      const serialized = serializeError(error);

      expect(serialized.cause).toBe('String cause');
    });

    it('should handle error without stack', () => {
      const error = { name: 'CustomError', message: 'No stack error' };

      const serialized = serializeError(error);

      expect(serialized.name).toBe('CustomError');
      expect(serialized.message).toBe('No stack error');
      expect(serialized.stack).toBeUndefined();
    });

    it('should handle error without name', () => {
      const error = { message: 'Error without name' };

      const serialized = serializeError(error);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('Error without name');
    });

    it('should handle error without message', () => {
      const error = { name: 'CustomError' };

      const serialized = serializeError(error);

      expect(serialized.name).toBe('CustomError');
      expect(serialized.message).toBe('[object Object]');
    });

    it('should handle null error', () => {
      const serialized = serializeError(null);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('null');
      expect(serialized.stack).toBeUndefined();
      expect(serialized.cause).toBeUndefined();
    });

    it('should handle undefined error', () => {
      const serialized = serializeError(undefined);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('undefined');
      expect(serialized.stack).toBeUndefined();
      expect(serialized.cause).toBeUndefined();
    });

    it('should handle string error', () => {
      const serialized = serializeError('String error');

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('String error');
      expect(serialized.stack).toBeUndefined();
    });

    it('should handle number error', () => {
      const serialized = serializeError(42);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('42');
      expect(serialized.stack).toBeUndefined();
    });

    it('should handle boolean error', () => {
      const serialized = serializeError(true);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('true');
      expect(serialized.stack).toBeUndefined();
    });

    it('should handle object error', () => {
      const error = { foo: 'bar', baz: 123 };

      const serialized = serializeError(error);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('[object Object]');
    });

    it('should handle error with empty stack', () => {
      const error = new Error('Test');
      error.stack = '';

      const serialized = serializeError(error);

      expect(serialized.stack).toEqual(['']);
    });

    it('should handle error with single line stack', () => {
      const error = new Error('Test');
      error.stack = 'Error: Test';

      const serialized = serializeError(error);

      expect(serialized.stack).toEqual(['Error: Test']);
    });

    it('should handle error with exactly 10 lines in stack', () => {
      const error = new Error('Test');
      error.stack = Array.from({ length: 10 }, (_, i) => `Line ${i}`).join('\n');

      const serialized = serializeError(error);

      expect(serialized.stack!.length).toBe(10);
    });

    it('should handle error with less than 10 lines in stack', () => {
      const error = new Error('Test');
      error.stack = 'Line 1\nLine 2\nLine 3';

      const serialized = serializeError(error);

      expect(serialized.stack!.length).toBe(3);
      expect(serialized.stack).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });

    it('should handle error with cause that is an object', () => {
      const error = new Error('Main error');
      (error as any).cause = { nested: 'object' };

      const serialized = serializeError(error);

      expect(serialized.cause).toBe('[object Object]');
    });

    it('should handle error with cause that is null', () => {
      const error = new Error('Main error');
      (error as any).cause = null;

      const serialized = serializeError(error);

      // null cause is falsy, so it becomes undefined
      expect(serialized.cause).toBeUndefined();
    });

    it('should handle error with cause that is undefined', () => {
      const error = new Error('Main error');
      (error as any).cause = undefined;

      const serialized = serializeError(error);

      expect(serialized.cause).toBeUndefined();
    });

    it('should handle error with cause that is a number', () => {
      const error = new Error('Main error');
      (error as any).cause = 404;

      const serialized = serializeError(error);

      expect(serialized.cause).toBe('404');
    });

    it('should preserve error type information', () => {
      class ValidationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'ValidationError';
        }
      }

      const error = new ValidationError('Validation failed');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('ValidationError');
      expect(serialized.message).toBe('Validation failed');
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Type error occurred');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('TypeError');
      expect(serialized.message).toBe('Type error occurred');
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Reference error occurred');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('ReferenceError');
      expect(serialized.message).toBe('Reference error occurred');
    });

    it('should handle SyntaxError', () => {
      const error = new SyntaxError('Syntax error occurred');
      const serialized = serializeError(error);

      expect(serialized.name).toBe('SyntaxError');
      expect(serialized.message).toBe('Syntax error occurred');
    });
  });
});

