import { Injectable, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Prisma } from '@prisma/client';
import {ArticleCategoriesService} from "../article-categoris/article-categoris.service";

@Injectable()
export class ArticlesService {
  constructor(
      @Inject(forwardRef(() => ArticleCategoriesService))
      private articleCategoryService: ArticleCategoriesService,
      private prisma: PrismaService,
  ) {}

  // Create a new article with photos
  async create(createArticleDto: CreateArticleDto, photos: Array<Express.Multer.File>) {
    const { articleCategoryIds, colorIds, tagIds, price, inventory, ...articleData } = createArticleDto;
    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`) || [];

    const articleCategoryConnect = articleCategoryIds?.length
        ? { connect: articleCategoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    const tagsConnect = tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined;

    try {
      return await this.prisma.article.create({
        data: {
          ...articleData,
          price: price || null,
          inventory: inventory || null,
          categories: articleCategoryConnect,
          colors: colorConnect,
          tags: tagsConnect,
          photos: photoUrls.length
              ? { create: photoUrls.map((url) => ({ url })) }
              : undefined, // Only create photos if there are URLs
        },
        include: {
          categories: true,
          colors: true,
          photos: true,
          tags: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating the article', error.message);
    }
  }

  // Get all articles with filtering, pagination, and sorting
  async findAll(
      page: number = 1,
      limit: number = 10,
      articleCategoryIds?: string,
      colorIds?: string,
      brandId?: string,
      minPrice?: number,
      maxPrice?: number,
      sortBy: string = 'createdAt',
      sort: 'asc' | 'desc' = 'asc',
  ) {
    const articleCategoryIdsArray = articleCategoryIds ? articleCategoryIds.split(',').map(Number) : undefined;
    const colorIdsArray = colorIds ? colorIds.split(',').map(Number) : undefined;
    const brandIdNumber = brandId ? Number(brandId) : undefined;

    const where: Prisma.ArticleWhereInput = {
      isDeleted: false,
      categories: articleCategoryIdsArray
          ? { some: { id: { in: articleCategoryIdsArray } } }
          : undefined,
      colors: colorIdsArray?.length
          ? { some: { id: { in: colorIdsArray } } }
          : undefined,
      brand: brandIdNumber
          ? { id: brandIdNumber } // Filtering via the related `brand` model
          : undefined,      price: minPrice || maxPrice ? { gte: minPrice, lte: maxPrice } : undefined,
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
      return await this.prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sort,
        },
        include: {
          categories: true,
          colors: true,
          photos: true,
          tags: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching articles', error.message);
    }
  }

  // Get a single article by ID
  async findOne(id: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: {
          categories: true,
          colors: true,
          photos: true,
          tags: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      return article;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching the article', error.message);
    }
  }

  // Update an existing article with new data and photos
  async update(id: number, updateArticleDto: UpdateArticleDto, photos: Array<Express.Multer.File>) {
    const { articleCategoryIds, colorIds, tagIds, ...articleData } = updateArticleDto;
    const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`) || [];

    const articleCategoryConnect = articleCategoryIds?.length
        ? { connect: articleCategoryIds.map((id) => ({ id })) }
        : undefined;

    const colorConnect = colorIds?.length
        ? { connect: colorIds.map((id) => ({ id })) }
        : undefined;

    const tagsConnect = tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined;

    const photoData = photoUrls.length > 0
        ? { create: photoUrls.map((url) => ({
            url,
            article: { connect: { id } }, // Connect the photo to the article
          })) }
        : undefined;

    try {
      // Update the article and connect tags
      const article = await this.prisma.article.update({
        where: { id },
        data: {
          ...articleData,
          categories: articleCategoryConnect,
          colors: colorConnect,
          tags: tagsConnect ? { connect: tagsConnect.connect } : undefined,
          photos: photoData,
        },
        include: {
          categories: true,
          colors: true,
          photos: true,
          tags: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      return article;
    } catch (error) {
      throw new InternalServerErrorException('Error updating the article', error.message);
    }
  }

  // Delete all photos by article ID
  async deleteAllPhotosByArticleId(articleId: number) {
    try {
      const deleted = await this.prisma.photo.deleteMany({
        where: { articleId },
      });

      if (deleted.count === 0) {
        throw new NotFoundException(`No photos found for article with ID ${articleId}`);
      }

      return deleted.count;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting photos', error.message);
    }
  }

  // Delete an article and its associated photos
  async deleteArticleAndPhotos(articleId: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found`);
      }

      return this.prisma.$transaction(async (transaction) => {
        await transaction.photo.deleteMany({
          where: { articleId },
        });

        return transaction.article.delete({
          where: { id: articleId },
        });
      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting the article and its photos', error.message);
    }
  }

  // Delete a specific photo from an article
  async deletePhoto(articleId: number, photoId: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found`);
      }

      const photo = await this.prisma.photo.findUnique({
        where: { id: photoId },
      });

      if (!photo || photo.articleId !== articleId) {
        throw new NotFoundException(`Photo with ID ${photoId} not found for this article`);
      }

      return this.prisma.photo.delete({
        where: { id: photoId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting the photo', error.message);
    }
  }

  // Get all photos for an article by article ID
  async getPhotosByArticleId(articleId: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
        include: { photos: true },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found`);
      }

      return article.photos;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching photos for the article', error.message);
    }
  }
}
