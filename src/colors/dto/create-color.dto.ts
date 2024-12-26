// src/colors/dto/create-color.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    color: string;
}