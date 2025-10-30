import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RequestContextService } from '../common/request-context.service';
import { RequestLoggerService } from '../common/request-logger.service';
import { ServiceA } from '../common/service-a.service';
import { ServiceB } from '../common/service-b.service';

/**
 * ProductsModule demonstrates:
 * - Multiple routes for grouping visualization
 * - REQUEST-scoped dependencies (RequestContextService, RequestLoggerService) used by controller
 * - Circular dependencies (ServiceA <-> ServiceB)
 */
@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    RequestContextService,
    RequestLoggerService,
    ServiceA,
    ServiceB,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}

