import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import {PrismaModule} from "../../prisma/prisma.module";
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [PrismaModule],
  controllers: [PhotosController],
  providers: [PhotosService, PrismaService],
})
export class PhotosModule {}
