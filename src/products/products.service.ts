import { Injectable, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
import slugify from '@sindresorhus/slugify'; // اضافه کردن import برای slugify

@Injectable()
export class ProductsService {
  constructor(
      @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService,
      private prisma: PrismaService,
  ) {}

  // ایجاد یک محصول جدید همراه با تصاویر
  async create(createProductDto: CreateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, tagIds, price, inventory, brandId, ...productData } = createProductDto;

    const slug = slugify(productData.name); // Generate slug from product name

    // Check if the product already exists by name (or slug)
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new InternalServerErrorException('محصولی با این نام وجود داشته است');
    }

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
          slug, // Add slug field
          price: price || null,
          inventory: inventory || null,
          Category: categoryConnect,
          colors: colorConnect,
          tags: tagsConnect, // Connect tags
          photos: {
            create: photoUrls?.map((url) => ({ url })),
          },
          brandId: brandId || null, // Make sure brandId is passed as a number
        },
        include: { Category: true, colors: true, brand: true, photos: true, tags: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('خطا در ایجاد محصول', error.message);
    }
  }



  // گرفتن تمامی محصولات با فیلتر، صفحه‌بندی و مرتب‌سازی
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
          tags: true, // گنجاندن برچسب‌ها در نتیجه
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('خطا در دریافت محصولات', error.message);
    }
  }

  // دریافت یک محصول با شناسه یا slug
  async findOne(identifier: string | number) {
    const isNumeric = !isNaN(Number(identifier));

    const where: Prisma.ProductWhereUniqueInput = isNumeric
        ? { id: Number(identifier) }  // اگر عددی بود از 'id' استفاده کن
        : { slug: String(identifier) };  // اگر string بود از 'slug' استفاده کن

    try {
      const product = await this.prisma.product.findUnique({
        where,
        include: {
          Category: true,
          colors: true,
          brand: true,
          photos: true,
          tags: true, // گنجاندن برچسب‌ها در نتیجه
        },
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${identifier} یافت نشد`);
      }

      return product;
    } catch (error) {
      throw new InternalServerErrorException('خطا در دریافت محصول', error.message);
    }
  }

  // یافتن محصول با شناسه یا slug
  async findProductByIdentifier(identifier: string) {
    const isNumeric = !isNaN(Number(identifier));

    const where: Prisma.ProductWhereUniqueInput =
        isNumeric
            ? { id: Number(identifier) }  // اگر عددی بود از 'id' استفاده کن
            : { slug: identifier };        // اگر string بود از 'slug' استفاده کن

    try {
      const product = await this.prisma.product.findUnique({
        where,
        include: {
          Category: true,
          colors: true,
          brand: true,
          photos: true,
          tags: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${identifier} یافت نشد`);
      }

      return product;
    } catch (error) {
      throw new InternalServerErrorException('خطا در دریافت محصول', error.message);
    }
  }

  // به‌روزرسانی محصول موجود با داده‌ها و تصاویر جدید
  async update(identifier: string | number, updateProductDto: UpdateProductDto, photos: Array<Express.Multer.File>) {
    const { categoryIds, colorIds, tagIds, name, ...productData } = updateProductDto;

    const slug = name ? slugify(name) : undefined;

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

    const where: Prisma.ProductWhereUniqueInput =
        typeof identifier === 'number'
            ? { id: identifier }
            : { slug: identifier };

    try {
      const product = await this.prisma.product.update({
        where,
        data: {
          ...productData,
          slug, // فیلد slug به‌روز شده
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
          tags: true, // گنجاندن برچسب‌ها در نتیجه
        },
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${identifier} یافت نشد`);
      }

      return product;
    } catch (error) {
      throw new InternalServerErrorException('خطا در به‌روزرسانی محصول', error.message);
    }
  }

  // حذف تمامی تصاویر یک محصول با شناسه
  async deleteAllPhotosByProductIdentifier(identifier: string) {
    try {
      const productId = isNaN(Number(identifier)) ? identifier : Number(identifier);

      let numericProductId: number;

      if (typeof productId === 'string') {
        const product = await this.prisma.product.findUnique({
          where: { slug: productId },
          select: { id: true },
        });

        if (!product) {
          throw new NotFoundException(`محصول با slug ${productId} یافت نشد`);
        }

        numericProductId = product.id;
      } else {
        numericProductId = productId;
      }

      const deleted = await this.prisma.photo.deleteMany({
        where: {
          productId: numericProductId,
        },
      });

      if (deleted.count === 0) {
        throw new NotFoundException(`هیچ عکسی برای محصول با شناسه ${identifier} پیدا نشد`);
      }

      return deleted.count;
    } catch (error) {
      throw new InternalServerErrorException('خطا در حذف تصاویر', error.message);
    }
  }

  // حذف محصول و تصاویر مربوطه
  async deleteProductAndPhotos(identifier: string) {
    try {
      const productId = isNaN(Number(identifier)) ? identifier : Number(identifier);

      const whereCondition: Prisma.ProductWhereUniqueInput = isNaN(Number(identifier))
          ? { slug: identifier }
          : { id: Number(identifier) };

      const product = await this.prisma.product.findUnique({
        where: whereCondition,
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${identifier} یافت نشد`);
      }

      return this.prisma.$transaction(async (transaction) => {
        await transaction.photo.deleteMany({
          where: { productId: Number(product.id) },
        });

        return transaction.product.delete({
          where: { id: Number(product.id) },
        });
      });
    } catch (error) {
      throw new InternalServerErrorException('خطا در حذف محصول و تصاویر مربوطه', error.message);
    }
  }

  // حذف یک تصویر خاص از یک محصول
  async deletePhoto(productId: number, photoId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
      }

      const photo = await this.prisma.photo.findUnique({
        where: { id: photoId },
      });

      if (!photo || photo.productId !== productId) {
        throw new NotFoundException(`تصویر با شناسه ${photoId} برای این محصول یافت نشد`);
      }

      return this.prisma.photo.delete({
        where: { id: photoId },
      });
    } catch (error) {
      throw new InternalServerErrorException('خطا در حذف تصویر', error.message);
    }
  }

  // دریافت تمامی تصاویر یک محصول با شناسه محصول
  async getPhotosByProductId(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { photos: true },
      });

      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
      }

      return product.photos;
    } catch (error) {
      throw new InternalServerErrorException('خطا در دریافت تصاویر محصول', error.message);
    }
  }
}
