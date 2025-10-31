/**
 * Unit tests for configuration options
 */

import { describe, it, expect } from 'vitest';
import { mergeOptions, DEFAULT_OPTIONS, GraphStudioOptions } from '../options';

describe('Options', () => {
  describe('DEFAULT_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_OPTIONS.enabled).toBe(process.env.NODE_ENV !== 'production');
      expect(DEFAULT_OPTIONS.healthPath).toBe('/health');
    });
  });

  describe('mergeOptions()', () => {
    it('should return default options when no custom options provided', () => {
      const merged = mergeOptions();

      expect(merged).toEqual(DEFAULT_OPTIONS);
    });

    it('should return default options when empty object provided', () => {
      const merged = mergeOptions({});

      expect(merged).toEqual(DEFAULT_OPTIONS);
    });

    it('should merge custom enabled option', () => {
      const custom: GraphStudioOptions = {
        enabled: false,
      };

      const merged = mergeOptions(custom);

      expect(merged.enabled).toBe(false);
      expect(merged.healthPath).toBe(DEFAULT_OPTIONS.healthPath);
    });

    it('should merge custom healthPath option', () => {
      const custom: GraphStudioOptions = {
        healthPath: '/custom-health',
      };

      const merged = mergeOptions(custom);

      expect(merged.healthPath).toBe('/custom-health');
      expect(merged.enabled).toBe(DEFAULT_OPTIONS.enabled);
    });

    it('should merge multiple custom options', () => {
      const custom: GraphStudioOptions = {
        enabled: false,
        healthPath: '/custom-health',
      };

      const merged = mergeOptions(custom);

      expect(merged.enabled).toBe(false);
      expect(merged.healthPath).toBe('/custom-health');
    });

    it('should handle all options being customized', () => {
      const custom: GraphStudioOptions = {
        enabled: false,
        healthPath: '/custom-health',
      };

      const merged = mergeOptions(custom);

      expect(merged).toEqual(custom);
    });

    it('should not mutate the input options object', () => {
      const custom: GraphStudioOptions = {
        enabled: false,
        healthPath: '/custom',
      };

      const originalCustom = { ...custom };

      mergeOptions(custom);

      expect(custom).toEqual(originalCustom);
    });

    it('should not mutate DEFAULT_OPTIONS', () => {
      const originalDefaults = { ...DEFAULT_OPTIONS };

      mergeOptions({ enabled: false });

      expect(DEFAULT_OPTIONS).toEqual(originalDefaults);
    });

    it('should handle undefined values in custom options (spread behavior)', () => {
      const custom: GraphStudioOptions = {
        enabled: undefined,
        healthPath: '/custom',
      };

      const merged = mergeOptions(custom);

      // Spread operator includes undefined values, so they override defaults
      expect(merged.enabled).toBeUndefined();
      expect(merged.healthPath).toBe('/custom');
    });

    it('should handle empty string values', () => {
      const custom: GraphStudioOptions = {
        healthPath: '',
      };

      const merged = mergeOptions(custom);

      expect(merged.healthPath).toBe('');
    });
  });
});

