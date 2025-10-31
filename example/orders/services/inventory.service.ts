import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface InventoryItem {
  productId: string;
  available: number;
  reserved: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private inventory: Map<string, InventoryItem> = new Map();

  constructor() {
    // Initialize with some mock inventory
    this.inventory.set('PROD-001', { productId: 'PROD-001', available: 100, reserved: 0 });
    this.inventory.set('PROD-002', { productId: 'PROD-002', available: 50, reserved: 0 });
    this.inventory.set('PROD-003', { productId: 'PROD-003', available: 200, reserved: 0 });
    this.inventory.set('PROD-004', { productId: 'PROD-004', available: 75, reserved: 0 });
    this.inventory.set('PROD-005', { productId: 'PROD-005', available: 150, reserved: 0 });
  }

  async checkAvailability(productId: string, quantity: number): Promise<boolean> {
    this.logger.log(`Checking availability: ${productId} x ${quantity}`);
    
    const item = this.inventory.get(productId);
    
    if (!item) {
      throw new BadRequestException(`Product not found: ${productId}`);
    }

    const available = item.available - item.reserved;
    return available >= quantity;
  }

  async reserveItems(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    this.logger.log(`Reserving items: ${JSON.stringify(items)}`);

    // Check all items first
    for (const item of items) {
      const isAvailable = await this.checkAvailability(item.productId, item.quantity);
      if (!isAvailable) {
        throw new BadRequestException(
          `Insufficient inventory for product: ${item.productId}`,
        );
      }
    }

    // Reserve all items
    for (const item of items) {
      const inventoryItem = this.inventory.get(item.productId)!;
      inventoryItem.reserved += item.quantity;
      this.logger.log(
        `Reserved ${item.quantity} units of ${item.productId}. Available: ${inventoryItem.available - inventoryItem.reserved}`,
      );
    }
  }

  async releaseReservation(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    this.logger.log(`Releasing reservation: ${JSON.stringify(items)}`);

    for (const item of items) {
      const inventoryItem = this.inventory.get(item.productId);
      if (inventoryItem) {
        inventoryItem.reserved = Math.max(0, inventoryItem.reserved - item.quantity);
      }
    }
  }

  async commitReservation(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    this.logger.log(`Committing reservation: ${JSON.stringify(items)}`);

    for (const item of items) {
      const inventoryItem = this.inventory.get(item.productId);
      if (inventoryItem) {
        inventoryItem.available -= item.quantity;
        inventoryItem.reserved -= item.quantity;
        this.logger.log(
          `Committed ${item.quantity} units of ${item.productId}. Available: ${inventoryItem.available}`,
        );
      }
    }
  }

  getInventoryStatus(productId: string): InventoryItem | undefined {
    return this.inventory.get(productId);
  }
}

