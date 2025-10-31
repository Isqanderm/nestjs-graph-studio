import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface PaymentResult {
  transactionId: string;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  method: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  async processPayment(
    amount: number,
    method: string,
    customerId: string,
  ): Promise<PaymentResult> {
    this.logger.log(
      `Processing payment: $${amount} via ${method} for customer ${customerId}`,
    );

    // Simulate payment processing delay
    await this.delay(100);

    // Validate payment method
    const validMethods = ['credit_card', 'debit_card', 'paypal', 'stripe'];
    if (!validMethods.includes(method)) {
      throw new BadRequestException(`Invalid payment method: ${method}`);
    }

    // Simulate payment processing (90% success rate)
    const success = Math.random() > 0.1;

    const result: PaymentResult = {
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: success ? 'completed' : 'failed',
      amount,
      method,
    };

    this.logger.log(
      `Payment ${result.status}: ${result.transactionId} - $${amount}`,
    );

    return result;
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    this.logger.log(`Refunding payment: ${transactionId} - $${amount}`);
    await this.delay(50);
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

