import { OrderStatus } from '../dto/update-order.dto';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

