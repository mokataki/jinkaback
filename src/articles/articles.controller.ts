import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { photoUploadConfig } from '../utils/file-upload.util';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Create a new article with photos
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 5, photoUploadConfig))
  async create(
      @Body() createArticleDto: CreateArticleDto,
      @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    return this.articlesService.create(createArticleDto, photos);
  }

  // Get all articles with filtering, pagination, and sorting
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

  // Get a single article by ID or slug
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.articlesService.findArticleByIdentifier(identifier);
  }

  // Update an existing article with new data and photos
  @Patch(':identifier')
  @UseInterceptors(FilesInterceptor('photos', 5, photoUploadConfig))
  async update(
      @Param('identifier') identifier: string,
      @Body() updateArticleDto: UpdateArticleDto,
      @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    return this.articlesService.update(identifier, updateArticleDto, photos);
  }

  // Soft delete an article and its associated photos
  @Delete(':identifier')
  async deleteArticleAndPhotos(@Param('identifier') identifier: string) {
    return this.articlesService.deleteArticleAndPhotos(identifier);
  }

  // Delete a specific photo from an article
  @Delete(':articleId/photos/:photoId')
  async deletePhoto(
      @Param('articleId', ParseIntPipe) articleId: number,
      @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.articlesService.deletePhoto(articleId, photoId);
  }

  // Delete all photos for an article
  @Delete(':identifier/photos')
  async deleteAllPhotos(@Param('identifier') identifier: string) {
    return this.articlesService.deleteAllPhotosByArticleIdentifier(identifier);
  }

  // Get all photos for an article by its ID
  @Get(':articleId/photos')
  async getPhotosByArticleId(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.getPhotosByArticleId(articleId);
  }
}
