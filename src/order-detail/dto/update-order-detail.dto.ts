import {IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min} from "class-validator";

export class UpdateOrderDetailDto {
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
    totalPrice?: number; // Optional if service calculates it
}