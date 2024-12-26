// src/brands/dto/create-brand.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    brandName: string;
}

