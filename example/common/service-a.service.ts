import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { ServiceB } from './service-b.service';

/**
 * ServiceA that depends on ServiceB, creating a circular dependency.
 * ServiceA -> ServiceB -> ServiceA
 * 
 * This circular dependency should be detected and highlighted in red
 * when the "Detect circular dependencies" button is active.
 */
@Injectable()
export class ServiceA {
  private readonly logger = new Logger(ServiceA.name);

  constructor(
    @Inject(forwardRef(() => ServiceB))
    private readonly serviceB: ServiceB,
  ) {
    this.logger.log('ServiceA instantiated');
  }

  doSomethingA(): string {
    this.logger.log('ServiceA.doSomethingA() called');
    // Call ServiceB which will call back to ServiceA
    const resultFromB = this.serviceB.doSomethingB();
    return `ServiceA processed: ${resultFromB}`;
  }

  helperMethodA(): string {
    this.logger.log('ServiceA.helperMethodA() called');
    return 'Helper A result';
  }
}

