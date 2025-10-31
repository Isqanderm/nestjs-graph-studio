import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

/**
 * TasksModule - Demonstrates missing dependency detection
 *
 * This module provides TasksService, which tries to inject 'LOGGER_SERVICE'.
 * However, LOGGER_SERVICE is not provided anywhere, so it's a missing dependency.
 *
 * The dependency is marked as @Optional() in TasksService, so the application
 * can still bootstrap, but Graph Studio will detect it as a missing dependency.
 *
 * To fix this error, you would need to provide LOGGER_SERVICE:
 *
 * Example fix:
 * ```typescript
 * @Module({
 *   providers: [
 *     TasksService,
 *     {
 *       provide: 'LOGGER_SERVICE',
 *       useClass: CustomLoggerService,
 *     },
 *   ],
 *   exports: [TasksService],
 * })
 * ```
 */
@Module({
  imports: [],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

