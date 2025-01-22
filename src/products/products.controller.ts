import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { photoUploadConfig } from '../utils/file-upload.util';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Create a new product with photos
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 5, photoUploadConfig))
  async create(
      @Body() createProductDto: CreateProductDto,
      @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    return this.productsService.create(createProductDto, photos);
  }

  // Get all products with filtering, pagination, and sorting
  @Get()
  async findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('categoryIds') categoryIds?: string,
      @Query('colorIds') colorIds?: string,
      @Query('brandId') brandId?: string,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
      @Query('sortBy') sortBy: string = 'createdAt',
      @Query('sort') sort: 'asc' | 'desc' = 'asc',
  ) {
    return this.productsService.findAll(
        page,
        limit,
        categoryIds,
        colorIds,
        brandId,
        minPrice,
        maxPrice,
        sortBy,
        sort
    );
  }

  // Find a product by ID or slug
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.productsService.findProductByIdentifier(identifier); // Passing slug or ID as identifier
  }

  // Update an existing product with new data and photos
  @Patch(':identifier')
  @UseInterceptors(FilesInterceptor('photos', 5, photoUploadConfig))
  async update(
      @Param('identifier') identifier: string,  // Accept slug or ID as identifier
      @Body() updateProductDto: UpdateProductDto,
      @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    return this.productsService.update(identifier, updateProductDto, photos);
  }

  // Soft delete a product and its associated photos
  @Delete(':identifier')
  async remove(@Param('identifier') identifier: string) {
    return this.productsService.deleteProductAndPhotos(identifier);  // Pass slug or ID as identifier
  }

  // Delete a specific photo from a product
  @Delete(':productId/photos/:photoId')
  async deletePhoto(
      @Param('productId', ParseIntPipe) productId: number,
      @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.productsService.deletePhoto(productId, photoId);
  }

  // Delete all photos for a product
  @Delete(':identifier/photos')
  async deleteProductPhotos(@Param('identifier') identifier: string) {
    return this.productsService.deleteAllPhotosByProductIdentifier(identifier);
  }


  // Get all photos for a product
  @Get(':productId/photos')
  async getPhotosByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.getPhotosByProductId(productId);
  }
}
