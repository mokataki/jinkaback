import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateTagDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    metaTitle?: string;

    @IsString()
    @IsOptional()
    metaDescription?: string;

    @IsInt()
    @IsOptional()
    parentId?: number;
}
