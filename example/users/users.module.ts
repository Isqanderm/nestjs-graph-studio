import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OrdersModule } from '../orders/orders.module';

/**
 * UsersModule demonstrates:
 * - Circular module dependency with OrdersModule (UsersModule ↔ OrdersModule)
 * - Using forwardRef() to resolve circular dependency
 * - UsersService can access OrdersService to get user's order history
 */
@Module({
  imports: [forwardRef(() => OrdersModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

