import { IsString, IsOptional, IsBoolean, IsArray, IsInt } from 'class-validator';

export class CreateArticleCategoryDto {
    @IsString()
    categoryName: string;

    @IsString()
    categoryDescription: string;

    @IsOptional()
    @IsInt()
    parentId?: number;

    @IsOptional()
    @IsArray()
    children?: CreateArticleCategoryDto[]; // Nested categories (for hierarchical creation)
}
