// src/photos/dto/update-photo.dto.ts
import { IsString } from 'class-validator';

export class UpdatePhotoDto {
    @IsString()
    url: string;  // If you're updating the URL, for example.
}
