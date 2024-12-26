import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const photoUploadConfig: MulterOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = './uploads/photos'; // Directory for uploads
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname); // File extension
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            cb(null, filename); // Set the file name
        },
    }),
    limits: { fileSize: 22 * 1024 * 1024 }, // 8 MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
            return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
};
