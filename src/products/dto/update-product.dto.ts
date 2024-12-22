import { IsOptional, IsString, IsInt, IsPositive, IsArray } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsPositive()
    inventory?: number;

    @IsOptional()
    @IsArray()
    photos?: string[];
}
