import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService, Product } from './products.service';
import { RequestLoggerService } from '../common/request-logger.service';

/**
 * ProductsController handles product-related HTTP requests.
 * Depends on ProductsService and RequestLoggerService (REQUEST-scoped).
 * 
 * This controller provides multiple routes to make the "Group entrypoints"
 * feature more visible in the graph visualization.
 */
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly requestLogger: RequestLoggerService,
  ) {}

  @Get()
  findAll(@Query('category') category?: string): Product[] {
    this.requestLogger.log('GET /products', 'ProductsController');
    
    if (category) {
      return this.productsService.findByCategory(category);
    }
    
    return this.productsService.findAll();
  }

  @Get('stats')
  getStats(): { total: number; byCategory: Record<string, number> } {
    this.requestLogger.log('GET /products/stats', 'ProductsController');
    return this.productsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Product {
    this.requestLogger.log(`GET /products/${id}`, 'ProductsController');
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Product {
    this.requestLogger.log('POST /products', 'ProductsController');
    return this.productsService.create(productData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updates: Partial<Omit<Product, 'id' | 'createdAt'>>,
  ): Product {
    this.requestLogger.log(`PUT /products/${id}`, 'ProductsController');
    return this.productsService.update(id, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.requestLogger.log(`DELETE /products/${id}`, 'ProductsController');
    this.productsService.remove(id);
  }
}

