import { Injectable, Scope, Logger } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

/**
 * REQUEST-scoped logger that includes request context in all log messages.
 * Depends on RequestContextService (also REQUEST-scoped).
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestLoggerService {
  private readonly logger = new Logger('RequestLogger');

  constructor(private readonly requestContext: RequestContextService) {}

  log(message: string, context?: string): void {
    const { requestId, userId } = this.requestContext.getContextInfo();
    this.logger.log(
      `[${requestId}${userId ? ` | User: ${userId}` : ''}] ${message}`,
      context,
    );
  }

  error(message: string, trace?: string, context?: string): void {
    const { requestId, userId } = this.requestContext.getContextInfo();
    this.logger.error(
      `[${requestId}${userId ? ` | User: ${userId}` : ''}] ${message}`,
      trace,
      context,
    );
  }

  warn(message: string, context?: string): void {
    const { requestId, userId } = this.requestContext.getContextInfo();
    this.logger.warn(
      `[${requestId}${userId ? ` | User: ${userId}` : ''}] ${message}`,
      context,
    );
  }

  debug(message: string, context?: string): void {
    const { requestId, userId } = this.requestContext.getContextInfo();
    this.logger.debug(
      `[${requestId}${userId ? ` | User: ${userId}` : ''}] ${message}`,
      context,
    );
  }
}

