// src/order/dto/create-order.dto.ts
import {IsInt, IsOptional, IsString, IsNotEmpty, IsNumber} from 'class-validator';

export class CreateOrderDto {
    @IsInt()
    @IsNotEmpty()
    shippingAddressId: number; // شناسه آدرس حمل و نقل

    @IsOptional()
    @IsString()
    guestId?: string | null; // شناسه مهمان (اختیاری برای کاربران مهمان)

    @IsInt()
    @IsOptional()
    userId?: number; // شناسه کاربر (برای سفارش‌هایی که توسط کاربران وارد شده انجام می‌شود)

    @IsNumber()
    shippingCostId?: number; // This is the ID of the shipping cost to be applied
}
