import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PhotosService } from '../photos/photos.service';
import { Prisma } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
      @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService,
      private prisma: PrismaService,
      private photosService: PhotosService,
  ) {}

  // Create a new product with photos
  async create(createProductDto: CreateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, price, inventory, ...productData } = createProductDto;

    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`);

    const categoryConnect = categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    return this.prisma.product.create({
      data: {
        ...productData,
        price: price || null,
        inventory: inventory || null,
        Category: categoryConnect,
        colors: colorConnect,
        photos: {
          create: photoUrls?.map((url) => ({ url })),
        },
      },
      include: { Category: true, colors: true, brand: true, photos: true },
    });
  }

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

    // // Handle sorting by newest/oldest or any other field
    // const orderBy: Prisma.ProductOrderByWithRelationInput = {
    //   [sortBy]: sort,  // Default to sorting by the specified sortBy field (createdAt or others)
    // };
    // If sorting by 'oldest' (asc), adjust the query to include products from the last two weeks
    //
    //
    if (sort === 'desc') {
      // Get the current date and subtract two weeks (14 days)
      // const twoWeeksAgo = new Date();
      // twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 5);

      const fiveHoursAgo = new Date();
      fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 24 * 1);

      where.createdAt = {
        gte: fiveHoursAgo, // Only products created within the last 2 weeks
      };


      // where.createdAt = {
      //   gte: twoWeeksAgo, // Only products created within the last 2 weeks
      // };

      // Optionally, set a minimum number of products to return (e.g., 20)
      limit = 15; // This ensures you get at least 20 products from the last 2 weeks, sorted by oldest
    }


    // Check if sorting is by 'oldest' (ascending)
    if (sort === 'desc') {
      // If sorting by 'oldest', ensure at least 20 products are returned
      limit = 15;
    }
    return this.prisma.product.findMany({
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
      },
    });
  }

  // Get a single product by ID
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { Category: true, colors: true, brand: true, photos: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update an existing product with new data and photos
  async update(id: number, updateProductDto: UpdateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, ...productData } = updateProductDto;

    // Map uploaded photos to URLs, or use an empty array if no photos are provided
    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`) || [];

    // Prepare categories and colors to connect
    const categoryConnect = categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    // If no new photos are uploaded, do not modify existing photos
    const photoData = photoUrls.length > 0
        ? { create: photoUrls.map((url) => ({ url })) } // Only add new photos if provided
        : undefined; // No photo changes, so don't modify existing photos

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData, // Update other product fields
        Category: categoryConnect, // Connect updated categories
        colors: colorConnect, // Connect updated colors
        photos: photoData, // Only add new photos if provided
      },
      include: {
        Category: true,
        colors: true,
        brand: true,
        photos: true,
      },
    });
  }


  // Delete all photos by product ID
  async deleteAllPhotosByProductId(productId: number) {
    const deleted = await this.prisma.photo.deleteMany({
      where: { productId },
    });

    if (deleted.count === 0) {
      throw new Error('No photos found for this product');
    }

    return deleted.count;
  }

  // Delete a product and its associated photos
  async deleteProductAndPhotos(productId: number) {
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

      const deletedProduct = await transaction.product.delete({
        where: { id: productId },
      });

      return deletedProduct;
    });
  }

  // Delete a specific photo from a product
  async deletePhoto(productId: number, photoId: number) {
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
  }

  // Get all photos for a product by product ID
  async getPhotosByProductId(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { photos: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.photos;
  }
}
