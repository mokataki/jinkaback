import { IsNumber, IsString } from 'class-validator';

export class ShippingCostDto {
    @IsNumber()
    weight: number;  // Weight in kg (or any unit of measurement)

    @IsString()
    destination: string;  // Destination, such as "USA", "Europe", etc.

    @IsString()
    shippingMethod: string;  // Shipping method, like "standard", "express"

    @IsNumber()
    cost: number;  // Shipping cost amount
}
