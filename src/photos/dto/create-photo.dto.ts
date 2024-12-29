// src/photos/dto/create-photo.dto.ts
import { IsString, IsInt } from 'class-validator';

export class CreatePhotoDto {
    @IsString()
    url: string;

    @IsInt()
    productId: number;

    @IsInt()
    articleId: number;
}
