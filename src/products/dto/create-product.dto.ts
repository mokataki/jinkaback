import {
    IsString,
    IsInt,
    IsOptional,
    IsArray,
    IsNumber,
    IsNotEmpty, IsBoolean,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    shortDescription: string;

    @IsString()
    @IsNotEmpty()
    longDescription: string;

    @IsOptional()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsInt()
    inventory: number;

    @IsArray()
    @IsOptional()
    categoryIds?: number[];

    @IsArray()
    @IsOptional()
    colorIds?: number[];

    @IsArray()
    @IsOptional()
    tagIds?: number[];  // Add this line to accept tags

    @IsInt()
    @IsOptional()
    brandId?: number;

    @IsArray()
    @IsOptional()
    photos?: string[];

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;


}
