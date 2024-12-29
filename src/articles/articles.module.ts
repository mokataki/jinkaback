import { forwardRef, Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaService } from "../../prisma/prisma.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { ArticleCategorisModule } from "../article-categoris/article-categoris.module";

@Module({
  imports: [PrismaModule, forwardRef(() => ArticleCategorisModule)],  // Ensure ArticleCategorisModule is imported

  controllers: [ArticlesController],  // Only controllers here
  providers: [ArticlesService, PrismaService],  // PrismaService is a provider, not a controller
})
export class ArticlesModule {}
