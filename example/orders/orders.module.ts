import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { PaymentService } from './services/payment.service';
import { InventoryService } from './services/inventory.service';
import { NotificationService } from './services/notification.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ParseOrderIdPipe } from './pipes/parse-order-id.pipe';
import { UsersModule } from '../users/users.module';

/**
 * OrdersModule demonstrates:
 * - Circular module dependency with UsersModule (OrdersModule ↔ UsersModule)
 * - Using forwardRef() to resolve circular dependency
 * - OrdersService can access UsersService to validate customer information
 * - Complex execution chains with guards, interceptors, and pipes
 */
@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PaymentService,
    InventoryService,
    NotificationService,
    AuthGuard,
    RolesGuard,
    LoggingInterceptor,
    TransformInterceptor,
    ParseOrderIdPipe,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}

