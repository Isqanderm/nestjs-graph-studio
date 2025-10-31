import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ServiceA } from '../common/service-a.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProductsService manages product data.
 * Depends on ServiceA (which has circular dependency with ServiceB).
 *
 * Note: This service does NOT depend on REQUEST-scoped services to avoid
 * the service being recreated on every request (which would lose the in-memory product data).
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private products: Map<string, Product> = new Map();

  constructor(
    private readonly serviceA: ServiceA,
  ) {
    this.logger.log('ProductsService instantiated');
    this.seedProducts();
  }

  private seedProducts(): void {
    const sampleProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 1299.99,
        stock: 15,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-2',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        stock: 50,
        category: 'Accessories',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-3',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 149.99,
        stock: 25,
        category: 'Accessories',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  findAll(): Product[] {
    return Array.from(this.products.values());
  }

  findOne(id: string): Product {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  findByCategory(category: string): Product[] {
    return Array.from(this.products.values()).filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...productData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);

    // Use ServiceA to demonstrate circular dependency
    this.serviceA.doSomethingA();

    return product;
  }

  update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product {
    const product = this.findOne(id);
    const updated = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    // Verify product exists before deleting
    this.findOne(id);
    this.products.delete(id);
  }

  getStats(): { total: number; byCategory: Record<string, number> } {
    const products = Array.from(this.products.values());
    const byCategory: Record<string, number> = {};

    products.forEach((product) => {
      byCategory[product.category] = (byCategory[product.category] || 0) + 1;
    });

    return {
      total: products.length,
      byCategory,
    };
  }
}

