import { Injectable, NotFoundException,  InternalServerErrorException,  Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
      @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService,
      private prisma: PrismaService,
  ) {}

  // Create a new product with photos
  async create(createProductDto: CreateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, tagIds, price, inventory, ...productData } = createProductDto;

    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`);

    const categoryConnect = categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    const tagsConnect = tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined;

    try {
      return await this.prisma.product.create({
        data: {
          ...productData,
          price: price || null,
          inventory: inventory || null,
          Category: categoryConnect,
          colors: colorConnect,
          tags: tagsConnect, // Connect multiple tags to the product
          photos: {
            create: photoUrls?.map((url) => ({ url })),
          },
        },
        include: { Category: true, colors: true, brand: true, photos: true, tags: true }, // Include tags in the result
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating the product', error.message);
    }
  }



  // Get all products with filtering, pagination, and sorting
  // Get all products with filtering, pagination, and sorting
  async findAll(
      page: number = 1,
      limit: number = 10,
      categoryIds?: string,
      colorIds?: string,
      brandId?: string,
      minPrice?: number,
      maxPrice?: number,
      sortBy: string = 'createdAt',
      sort: 'asc' | 'desc' = 'asc',
  ) {
    const categoryIdsArray = categoryIds ? categoryIds.split(',').map(Number) : undefined;
    const colorIdsArray = colorIds ? colorIds.split(',').map(Number) : undefined;
    const brandIdNumber = brandId ? Number(brandId) : undefined;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      Category: categoryIdsArray
          ? { some: { id: { in: categoryIdsArray } } }
          : undefined,
      colors: colorIdsArray?.length
          ? { some: { id: { in: colorIdsArray } } }
          : undefined,
      brandId: brandIdNumber || undefined,
      price: minPrice || maxPrice
          ? { gte: minPrice, lte: maxPrice }
          : undefined,
      isPublished: true,
    };

    if (sort === 'desc') {
      const fiveHoursAgo = new Date();
      fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 24);

      where.createdAt = {
        gte: fiveHoursAgo,
      };
      limit = 15;
    }

    try {
      return await this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sort,
        },
        include: {
          Category: true,
          colors: true,
          brand: true,
          photos: true,
          tags: true, // Include tags in the result
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching products', error.message);
    }
  }


  // Get a single product by ID
  // Get a single product by ID
  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          Category: true,
          colors: true,
          brand: true,
          photos: true,
          tags: true, // Include tags in the result
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching the product', error.message);
    }
  }


  // Update an existing product with new data and photos
  async update(id: number, updateProductDto: UpdateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, tagIds, ...productData } = updateProductDto;
    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`) || [];

    const categoryConnect = categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    const tagsConnect = tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined;

    const photoData = photoUrls.length > 0
        ? { create: photoUrls.map((url) => ({ url })) }
        : undefined;

    try {
      // Update the product and connect tags
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...productData,
          Category: categoryConnect,
          colors: colorConnect,
          tags: tagsConnect ? { connect: tagsConnect.connect } : undefined,
          photos: photoData,
        },
        include: {
          Category: true,
          colors: true,
          brand: true,
          photos: true,
          tags: true, // Include tags in the result
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      throw new InternalServerErrorException('Error updating the product', error.message);
    }
  }





  // Delete all photos by product ID
  async deleteAllPhotosByProductId(productId: number) {
    try {
      const deleted = await this.prisma.photo.deleteMany({
        where: { productId },
      });

      if (deleted.count === 0) {
        throw new NotFoundException(`No photos found for product with ID ${productId}`);
      }

      return deleted.count;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting photos', error.message);
    }
  }

  // Delete a product and its associated photos
  async deleteProductAndPhotos(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return this.prisma.$transaction(async (transaction) => {
        await transaction.photo.deleteMany({
          where: { productId },
        });

        return  transaction.product.delete({
          where: { id: productId },
        });

      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting the product and its photos', error.message);
    }
  }

  // Delete a specific photo from a product
  async deletePhoto(productId: number, photoId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const photo = await this.prisma.photo.findUnique({
        where: { id: photoId },
      });

      if (!photo || photo.productId !== productId) {
        throw new NotFoundException(`Photo with ID ${photoId} not found for this product`);
      }

      return this.prisma.photo.delete({
        where: { id: photoId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting the photo', error.message);
    }
  }

  // Get all photos for a product by product ID
  async getPhotosByProductId(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { photos: true },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return product.photos;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching photos for the product', error.message);
    }
  }
}
