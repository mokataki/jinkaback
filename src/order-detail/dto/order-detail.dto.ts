import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateOrderDetailDto {
    @IsInt()
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsInt()
    @Min(0)
    unitPrice: number;

    @IsOptional()
    @IsInt()
    totalPrice?: number; // Can be calculated in the service
}

export class UpdateOrderDetailDto {
    @IsInt()
    @Min(1)
    quantity: number;

    @IsInt()
    @Min(0)
    unitPrice: number;

    @IsInt()
    totalPrice: number;
}
