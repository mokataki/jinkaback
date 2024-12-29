import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ArticlesModule } from '../articles/articles.module';
import { ArticleCategoriesService } from './article-categoris.service';  // Service correctly imported
import { ArticleCategoriesController } from './article-categoris.controller';
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [PrismaModule, forwardRef(() => ArticlesModule)],  // Import ArticlesModule correctly
  controllers: [ArticleCategoriesController],  // Only controllers here, not PrismaService
  providers: [ArticleCategoriesService, PrismaService],  // PrismaService is a provider here
  exports: [ArticleCategoriesService],  // Export the service so others can use it
})
export class ArticleCategorisModule {}
