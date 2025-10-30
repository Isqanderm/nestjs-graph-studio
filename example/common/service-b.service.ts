import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { ServiceA } from './service-a.service';

/**
 * ServiceB that depends on ServiceA, completing the circular dependency.
 * ServiceB -> ServiceA -> ServiceB
 * 
 * This circular dependency should be detected and highlighted in red
 * when the "Detect circular dependencies" button is active.
 */
@Injectable()
export class ServiceB {
  private readonly logger = new Logger(ServiceB.name);

  constructor(
    @Inject(forwardRef(() => ServiceA))
    private readonly serviceA: ServiceA,
  ) {
    this.logger.log('ServiceB instantiated');
  }

  doSomethingB(): string {
    this.logger.log('ServiceB.doSomethingB() called');
    // Call ServiceA which creates the circular dependency
    const resultFromA = this.serviceA.helperMethodA();
    return `ServiceB processed: ${resultFromA}`;
  }

  helperMethodB(): string {
    this.logger.log('ServiceB.helperMethodB() called');
    return 'Helper B result';
  }
}

