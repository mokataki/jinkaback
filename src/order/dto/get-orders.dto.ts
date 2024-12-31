// src/order/dto/get-orders.dto.ts

import { IsInt } from 'class-validator';

export class GetOrdersDto {
    @IsInt()
    userId: number;  // The ID of the user to fetch orders for

    @IsInt()
    guestId: number;  // The ID of the user to fetch orders for


}
