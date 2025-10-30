import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../entities/order.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendOrderConfirmation(order: Order): Promise<void> {
    this.logger.log(`Sending order confirmation email for order ${order.id}`);
    // Simulate email sending
    await this.delay(50);
    this.logger.log(`Order confirmation sent to customer ${order.customerId}`);
  }

  async sendOrderStatusUpdate(orderId: string, status: string): Promise<void> {
    this.logger.log(`Sending status update for order ${orderId}: ${status}`);
    await this.delay(30);
    this.logger.log(`Status update notification sent`);
  }

  async sendPaymentFailureNotification(orderId: string, customerId: string): Promise<void> {
    this.logger.log(`Sending payment failure notification for order ${orderId}`);
    await this.delay(30);
    this.logger.log(`Payment failure notification sent to customer ${customerId}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

