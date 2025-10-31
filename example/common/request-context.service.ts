import { Injectable, Scope } from '@nestjs/common';

/**
 * REQUEST-scoped service that stores request-specific context data.
 * Each HTTP request gets its own instance of this service.
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private requestId: string;
  private userId?: string;
  private startTime: number;

  constructor() {
    this.requestId = this.generateRequestId();
    this.startTime = Date.now();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRequestId(): string {
    return this.requestId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  getContextInfo(): {
    requestId: string;
    userId?: string;
    elapsedTime: number;
  } {
    return {
      requestId: this.requestId,
      userId: this.userId,
      elapsedTime: this.getElapsedTime(),
    };
  }
}

