import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ParseOrderIdPipe } from './pipes/parse-order-id.pipe';
import { ParseQueryParamsPipe, QueryParamsDto } from './pipes/parse-query-params.pipe';
import { SanitizeInputPipe } from './pipes/sanitize-input.pipe';
import { TransformOrderDtoPipe } from './pipes/transform-order-dto.pipe';

@Controller('orders')
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(
    @Body(SanitizeInputPipe, TransformOrderDtoPipe) createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query(ParseQueryParamsPipe) queryParams: QueryParamsDto) {
    return this.ordersService.findAll(queryParams);
  }

  @Get('stats')
  getStats(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.ordersService.getOrderStats(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseOrderIdPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(
    @Param('id', ParseOrderIdPipe) id: string,
    @Body(SanitizeInputPipe) updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseOrderIdPipe) id: string) {
    return this.ordersService.remove(id);
  }
}

