import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    quantity: number; // Quantity of the product

    price?: number;  // Will be fetched from the database
}

export class CreateOrderDto {
    @IsNotEmpty()
    customerId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsNotEmpty()
    shippingAddress: string;

    @IsNotEmpty()
    paymentMethod: string;
}
