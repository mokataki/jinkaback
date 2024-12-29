import {IsInt, IsPositive, IsNumber, IsOptional, Min, IsNotEmpty} from 'class-validator';

export class CreateOrderDetailDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @Min(0)
    @IsPositive()
    unitPrice: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    totalPrice?: number; // Can be calculated in the service
}
