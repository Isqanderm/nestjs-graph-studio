import { Module } from '@nestjs/common';
import { GraphStudioModule } from '../src';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TasksModule } from './diagnostics/tasks.module';
// import { DiagnosticsModule } from './diagnostics/diagnostics.module';

/**
 * MISSING DEPENDENCY DEMONSTRATION:
 *
 * TasksModule is enabled and demonstrates missing dependency detection.
 * TasksService tries to inject 'LOGGER_SERVICE' which doesn't exist.
 *
 * The dependency is marked as @Optional(), so the application can bootstrap,
 * but Graph Studio will detect and visualize the missing dependency.
 *
 * When you open Graph Studio (http://localhost:3001/graph-studio), you will see:
 * - A red "⚠️ 1 Error" badge in the toolbar
 * - A MISSING node for LOGGER_SERVICE (red dashed circle)
 * - A red dashed edge from TasksService to LOGGER_SERVICE
 * - A red dotted border on TasksService (indicating it has missing dependencies)
 * - Clicking the error badge opens a diagnostics modal with:
 *   - Missing dependency name: LOGGER_SERVICE
 *   - Required by: TasksService
 *   - Suggested fix: "Add LOGGER_SERVICE to the module's providers..."
 *
 * To fix the error:
 * 1. Add a provider for LOGGER_SERVICE in TasksModule
 * 2. Graph Studio will show "✓ No errors" in green
 */

@Module({
  imports: [
    GraphStudioModule.forRoot({
      enabled: true,
    }),
    UsersModule,
    OrdersModule,
    ProductsModule,
    TasksModule, // <-- Enabled to demonstrate missing dependency detection
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

