import { Module } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';

/**
 * DiagnosticsModule
 * 
 * This module provides the DiagnosticsService but is intentionally
 * NOT imported by other modules that try to use it, demonstrating
 * missing module import errors in Graph Studio.
 */
@Module({
  providers: [DiagnosticsService],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}

