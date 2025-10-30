/**
 * Configuration options for GraphStudioModule
 */

export interface GraphStudioOptions {
  /**
   * Enable or disable the module. Default: false in production
   */
  enabled?: boolean;

  /**
   * Health check endpoint path. Default: '/health'
   */
  healthPath?: string;
}

export interface GraphStudioAsyncOptions {
  useFactory: (...args: any[]) => Promise<GraphStudioOptions> | GraphStudioOptions;
  inject?: any[];
}

export const DEFAULT_OPTIONS: Required<GraphStudioOptions> = {
  enabled: process.env.NODE_ENV !== 'production',
  healthPath: '/health',
};

export function mergeOptions(options: GraphStudioOptions = {}): Required<GraphStudioOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}

