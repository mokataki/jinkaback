import { IsNotEmpty, IsPositive, IsOptional } from 'class-validator';

export class UpdateOrderItemDto {
    @IsNotEmpty()
    productId: string;

    @IsOptional()
    @IsPositive()
    newQuantity?: number; // Optional: Only needed if decreasing quantity
}
