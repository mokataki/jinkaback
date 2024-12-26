// src/categories/dto/create-category.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    ValidateNested, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    categoryName: string;

    @IsString()
    @IsNotEmpty()
    categoryDescription: string;

    @IsOptional()
    @IsInt()
    parentId?: number | null;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCategoryDto) // Recursive validation
    children?: CreateCategoryDto[];
}
