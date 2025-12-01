import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsPositive,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus } from "../../entities/order.entity";

export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  subtotal: number;
}

export class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tax: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  shippingCost: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  total: number;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetUserOrdersDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class GetOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAllOrdersDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItemDto[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddressDto;
  status: OrderStatus;
  paymentId?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedOrdersResponseDto {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
