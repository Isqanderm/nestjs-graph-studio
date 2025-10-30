import { Injectable, Logger } from '@nestjs/common';

/**
 * DiagnosticsService - A service for system diagnostics
 * 
 * This service is intentionally NOT added to any module's providers array
 * to demonstrate missing dependency detection in Graph Studio.
 */
@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  /**
   * Check system health
   */
  checkHealth(): { status: string; timestamp: string } {
    this.logger.log('Checking system health...');
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system metrics
   */
  getMetrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
  } {
    this.logger.log('Getting system metrics...');
    
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
    };
  }

  /**
   * Log diagnostic information
   */
  logDiagnostics(message: string): void {
    this.logger.debug(`[DIAGNOSTICS] ${message}`);
  }
}

