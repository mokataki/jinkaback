import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
    @IsString()
    @IsNotEmpty()
    name: string;

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
