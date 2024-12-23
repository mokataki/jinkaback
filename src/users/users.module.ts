import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {PrismaModule} from "../../prisma/prisma.module";
import {MulterModule} from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import {extname} from "path";

@Module({
  imports:[PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/photos', // Path where files will be stored
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // Get file extension
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename); // Set the file name
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
