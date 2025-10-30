import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto, OrderStatus } from '../dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { PaymentService } from './payment.service';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';
import { UsersService } from '../../users/users.service';

/**
 * OrdersService manages order data and orchestrates payment, inventory, and notifications.
 *
 * Note: This service does NOT depend on REQUEST-scoped services to avoid
 * the service being recreated on every request (which would lose the in-memory order data).
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Map<string, Order> = new Map();
  private orderCounter = 1;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly inventoryService: InventoryService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating new order for customer ${createOrderDto.customerId}`);

    // Validate customer exists (demonstrates circular dependency: OrdersService -> UsersService)
    const customer = this.usersService.findOne(createOrderDto.customerId);
    if (!customer) {
      throw new BadRequestException(`Customer not found: ${createOrderDto.customerId}`);
    }

    // Calculate total amount
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Step 1: Reserve inventory
    try {
      await this.inventoryService.reserveItems(
        createOrderDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to reserve inventory: ${errorMessage}`);
      throw error;
    }

    // Step 2: Process payment
    let paymentResult;
    try {
      paymentResult = await this.paymentService.processPayment(
        totalAmount,
        createOrderDto.paymentMethod,
        createOrderDto.customerId,
      );
    } catch (error) {
      // Release inventory reservation if payment fails
      await this.inventoryService.releaseReservation(
        createOrderDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Payment processing failed: ${errorMessage}`);
      throw error;
    }

    // Check payment status
    if (paymentResult.status === 'failed') {
      await this.inventoryService.releaseReservation(
        createOrderDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
      await this.notificationService.sendPaymentFailureNotification(
        `ORD-${String(this.orderCounter).padStart(5, '0')}`,
        createOrderDto.customerId,
      );
      throw new BadRequestException('Payment failed');
    }

    // Step 3: Commit inventory reservation
    await this.inventoryService.commitReservation(
      createOrderDto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    // Step 4: Create order
    const orderId = `ORD-${String(this.orderCounter++).padStart(5, '0')}`;
    const order: Order = {
      id: orderId,
      customerId: createOrderDto.customerId,
      items: createOrderDto.items,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(orderId, order);
    this.logger.log(`Order created successfully: ${orderId}`);

    // Step 5: Send confirmation
    await this.notificationService.sendOrderConfirmation(order);

    return order;
  }

  async findAll(queryParams?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Order[]> {
    this.logger.log(`Fetching orders with params: ${JSON.stringify(queryParams)}`);
    let orders = Array.from(this.orders.values());

    // Filter by status if provided
    if (queryParams?.status) {
      orders = orders.filter((order) => order.status === queryParams.status);
    }

    // Sort orders
    if (queryParams?.sortBy) {
      orders.sort((a, b) => {
        const aValue = a[queryParams.sortBy as keyof Order];
        const bValue = b[queryParams.sortBy as keyof Order];

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return queryParams.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return queryParams.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Paginate
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return orders.slice(startIndex, endIndex);
  }

  async findOne(id: string): Promise<Order> {
    this.logger.log(`Fetching order: ${id}`);
    const order = this.orders.get(id);

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    this.logger.log(`Updating order: ${id}`);
    const order = await this.findOne(id);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
      await this.notificationService.sendOrderStatusUpdate(id, updateOrderDto.status);
    }

    if (updateOrderDto.trackingNumber) {
      order.trackingNumber = updateOrderDto.trackingNumber;
    }

    order.updatedAt = new Date();
    this.orders.set(id, order);

    this.logger.log(`Order updated successfully: ${id}`);
    return order;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Cancelling order: ${id}`);
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    // Release inventory
    await this.inventoryService.releaseReservation(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date();
    this.orders.set(id, order);

    await this.notificationService.sendOrderStatusUpdate(id, OrderStatus.CANCELLED);

    this.logger.log(`Order cancelled successfully: ${id}`);
  }

  async getOrderStats(days: number = 30): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalRevenue: number;
    averageOrderValue: number;
    period: string;
  }> {
    this.logger.log(`Fetching order stats for last ${days} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const orders = Array.from(this.orders.values()).filter(
      (order) => order.createdAt >= cutoffDate,
    );

    const byStatus: Record<string, number> = {};

    for (const order of orders) {
      byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    }

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      total: orders.length,
      byStatus,
      totalRevenue,
      averageOrderValue,
      period: `Last ${days} days`,
    };
  }
}

