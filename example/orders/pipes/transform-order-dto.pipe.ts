import { PipeTransform, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';

/**
 * Custom pipe that transforms and enriches the CreateOrderDto
 * by calculating totals and normalizing data.
 * This demonstrates a complex transformation pipe.
 */
@Injectable()
export class TransformOrderDtoPipe implements PipeTransform<CreateOrderDto, CreateOrderDto> {
  transform(value: CreateOrderDto): CreateOrderDto {
    // Normalize payment method to lowercase
    if (value.paymentMethod) {
      value.paymentMethod = value.paymentMethod.toLowerCase();
    }

    // Normalize customer ID
    if (value.customerId) {
      value.customerId = value.customerId.trim();
    }

    // Process items
    if (value.items && Array.isArray(value.items)) {
      value.items = value.items.map((item) => ({
        ...item,
        productId: item.productId.trim(),
        // Ensure quantity and price are numbers
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));
    }

    return value;
  }
}

