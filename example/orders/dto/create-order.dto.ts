import { IsNotEmpty, IsNumber, IsString, IsArray, Min, ArrayMinSize } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  items!: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;
}

