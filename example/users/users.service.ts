import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/services/orders.service';

/**
 * UsersService manages user data.
 *
 * Note: This service does NOT depend on REQUEST-scoped services to avoid
 * the service being recreated on every request (which would lose the in-memory user data).
 * Instead, we use the standard Logger for logging.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  findAll() {
    this.logger.log('Finding all users');
    return this.users;
  }

  findOne(id: string) {
    this.logger.log(`Finding user with id: ${id}`);
    const user = this.users.find((user) => user.id === id);
    return user;
  }

  create(user: any) {
    this.logger.log('Creating new user');
    const newUser = {
      id: String(this.users.length + 1),
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Get user's order history
   * This demonstrates the circular dependency: UsersService -> OrdersService
   */
  async getUserOrders(userId: string) {
    this.logger.log(`Getting orders for user: ${userId}`);
    const user = this.findOne(userId);
    if (!user) {
      return [];
    }

    // Use OrdersService to get all orders and filter by customerId
    const allOrders = await this.ordersService.findAll();
    return allOrders.filter((order) => order.customerId === userId);
  }
}

