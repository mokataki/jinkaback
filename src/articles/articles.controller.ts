import { Controller, Get, Post, Body, Param, Put, Delete, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ArticleCategoriesService } from '../article-categoris/article-categoris.service';

@Controller('articles')
export class ArticlesController {
  constructor(
      private readonly articlesService: ArticlesService,
      private readonly articleCategoriesService: ArticleCategoriesService,
  ) {}

  // Create a new article
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photos', maxCount: 5 },  // Adjust file handling as needed
  ]))
  async create(
      @Body() createArticleDto: CreateArticleDto,
      @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    return this.articlesService.create(createArticleDto, files?.photos || []);
  }

  // Get all articles with pagination and filtering
  @Get()
  async findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('articleCategoryIds') articleCategoryIds?: string,
      @Query('colorIds') colorIds?: string,
      @Query('brandId') brandId?: string,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
      @Query('sortBy') sortBy: string = 'createdAt',
      @Query('sort') sort: 'asc' | 'desc' = 'asc',
  ) {
    return this.articlesService.findAll(
        page,
        limit,
        articleCategoryIds,
        colorIds,
        brandId,
        minPrice,
        maxPrice,
        sortBy,
        sort,
    );
  }

  // Get a single article by ID
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.articlesService.findOne(id);
  }

  // Update an existing article
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photos', maxCount: 5 },  // Adjust file handling as needed
  ]))
  async update(
      @Param('id') id: number,
      @Body() updateArticleDto: UpdateArticleDto,
      @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    return this.articlesService.update(id, updateArticleDto, files?.photos || []);
  }

  // Delete all photos of an article by article ID
  @Delete(':id/photos')
  async deleteAllPhotos(@Param('id') articleId: number) {
    return this.articlesService.deleteAllPhotosByArticleId(articleId);
  }

  // Delete a specific photo of an article
  @Delete(':articleId/photos/:photoId')
  async deletePhoto(
      @Param('articleId') articleId: number,
      @Param('photoId') photoId: number,
  ) {
    return this.articlesService.deletePhoto(articleId, photoId);
  }

  // Delete an article and its associated photos
  @Delete(':id')
  async deleteArticleAndPhotos(@Param('id') articleId: number) {
    return this.articlesService.deleteArticleAndPhotos(articleId);
  }

  // Get all photos for a specific article
  @Get(':id/photos')
  async getPhotosByArticleId(@Param('id') articleId: number) {
    return this.articlesService.getPhotosByArticleId(articleId);
  }
}
