import { Injectable, Logger, Optional, Inject } from '@nestjs/common';

/**
 * TasksService - Demonstrates missing dependency detection
 *
 * This service tries to inject a non-existent 'LOGGER_SERVICE' token.
 * The dependency is marked as @Optional() so the application can still bootstrap,
 * but Graph Studio will detect it as a missing dependency.
 *
 * This allows us to demonstrate the missing dependency detection feature
 * without causing the application to crash on startup.
 *
 * Missing dependency: LOGGER_SERVICE (custom logger service that doesn't exist)
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    // This dependency doesn't exist, but it's optional so the app can start
    // Graph Studio will detect this as a missing dependency
    @Optional()
    @Inject('LOGGER_SERVICE')
    private readonly loggerService?: any,
  ) {
    if (!this.loggerService) {
      this.logger.warn('⚠️ LOGGER_SERVICE is not available (missing dependency)');
      this.logger.warn('This is intentional to demonstrate missing dependency detection');
    }
  }

  /**
   * Execute a task with optional logging
   */
  async executeTask(taskName: string): Promise<void> {
    this.logger.log(`Executing task: ${taskName}`);

    // Try to use the missing service (will be undefined)
    if (this.loggerService) {
      this.loggerService.log(`Task started: ${taskName}`);
    } else {
      this.logger.warn('Cannot log to LOGGER_SERVICE - dependency is missing');
    }

    // Simulate task execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (this.loggerService) {
      this.loggerService.log(`Task completed: ${taskName}`);
    }

    this.logger.log(`Task completed: ${taskName}`);
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): any {
    if (this.loggerService) {
      this.loggerService.log(`Getting status for task: ${taskId}`);
    }

    return {
      taskId,
      status: 'running',
      hasLogger: !!this.loggerService,
    };
  }

  /**
   * List all tasks
   */
  async listTasks(): Promise<string[]> {
    this.logger.log('Listing all tasks');

    if (this.loggerService) {
      this.loggerService.log('Fetching task list');
    }

    return ['Task 1', 'Task 2', 'Task 3'];
  }
}

