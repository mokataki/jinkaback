import { IsNotEmpty, IsPositive, IsOptional, IsArray } from 'class-validator';

export class AddProductDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;

    @IsPositive()
    price: number;

    @IsPositive()
    inventory: number;

    @IsArray()
    @IsOptional()
    photos?: string[];
}
export class AdjustInventoryDto {
    @IsPositive()
    quantity: number;
}
