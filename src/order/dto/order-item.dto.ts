// src/order/dto/order-item.dto.ts

import { IsInt, IsPositive } from 'class-validator';

export class OrderItemDto {
    @IsInt()
    productId: number;  // ID of the product being ordered

    @IsInt()
    @IsPositive()
    quantity: number;   // Quantity of the product

    @IsInt()
    @IsPositive()
    price: number;      // Price of the product at the time of the order
}
