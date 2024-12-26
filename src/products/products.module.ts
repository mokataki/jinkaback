import {forwardRef, Module} from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {PrismaService} from "../../prisma/prisma.service";
import {PhotosService} from "../photos/photos.service";
import {PrismaModule} from "../../prisma/prisma.module";
import {CategoriesModule} from "../categories/categories.module";

let categoriesService;

@Module({
  imports: [PrismaModule,forwardRef(() => CategoriesModule)],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, PhotosService],
})
export class ProductsModule {}
