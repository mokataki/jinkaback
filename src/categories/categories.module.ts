import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from "../../prisma/prisma.module";
import { ProductsModule } from "../products/products.module"; // Correctly import ProductsModule

@Module({
  imports: [PrismaModule, forwardRef(() => ProductsModule)], // Use forwardRef here
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], // Export CategoriesService so it can be used in other modules
})
export class CategoriesModule {}
