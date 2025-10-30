import { Injectable, Logger } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

/**
 * SINGLETON service that depends on REQUEST-scoped RequestContextService.
 * This creates an implicit REQUEST-scoped dependency - the AuditService
 * will be promoted to REQUEST scope due to its dependency.
 *
 * This demonstrates the transitive scope propagation in NestJS.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly requestContext: RequestContextService) {
    this.logger.log('AuditService instantiated');
  }

  logAction(action: string, entityType: string, entityId?: string): void {
    const context = this.requestContext.getContextInfo();
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      userId: context.userId,
      action,
      entityType,
      entityId,
      elapsedTime: context.elapsedTime,
    };

    this.logger.log(`Audit: ${JSON.stringify(logEntry)}`);
  }

  logRead(entityType: string, entityId: string): void {
    this.logAction('READ', entityType, entityId);
  }

  logCreate(entityType: string, entityId: string): void {
    this.logAction('CREATE', entityType, entityId);
  }

  logUpdate(entityType: string, entityId: string): void {
    this.logAction('UPDATE', entityType, entityId);
  }

  logDelete(entityType: string, entityId: string): void {
    this.logAction('DELETE', entityType, entityId);
  }
}

