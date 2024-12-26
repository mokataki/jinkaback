import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto {
    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    id?: number;  // Add the 'id' field for the update operation

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    categoryName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    categoryDescription?: string;

    @IsOptional()
    @IsInt()
    parentId?: number | null;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCategoryDto) // Recursive validation for children
    children?: CreateCategoryDto[];
}
