import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
    private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

    constructor() {
        if (!existsSync(this.uploadPath)) {
            mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    getUploadPath(): string {
        return this.uploadPath;
    }

    getFileUrl(filename: string): string {
        return `/uploads/${filename}`;
    }
}
