import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    inventory: number;
}
