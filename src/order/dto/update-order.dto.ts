// src/order/dto/update-order.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    status?: string;  // The current status of the order (e.g., 'processing', 'shipped', 'delivered')

    @IsOptional()
    @IsString()
    trackingNumber?: string;  // Tracking number for the shipment
}
