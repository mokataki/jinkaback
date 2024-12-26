import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {PrismaModule} from "../../prisma/prisma.module";
import {MulterModule} from "@nestjs/platform-express";
import {photoUploadConfig} from "../utils/file-upload.util";

@Module({
  imports:[PrismaModule,
    MulterModule.register(photoUploadConfig)],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
