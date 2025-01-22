export class Article {}
// import { Injectable, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { CreateArticleDto } from './dto/create-article.dto';
// import { UpdateArticleDto } from './dto/update-article.dto';
// import { Prisma } from '@prisma/client';
// import { CategoriesService } from '../categories/categories.service';
// import slugify from '@sindresorhus/slugify'; // اضافه کردن import برای slugify
//
// @Injectable()
// export class ArticlesService {
//     constructor(
//         @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService,
//         private prisma: PrismaService,
//     ) {}
//
//     // ایجاد یک مقاله جدید همراه با تصاویر
//     async create(createArticleDto: CreateArticleDto, photos: Array<Express.Multer.File>) {
//         const { articleCategoryIds, colorIds, tagIds, price, inventory, brandId, ...articleData } = createArticleDto;
//
//         const slug = slugify(articleData.name); // Generate slug from article name
//
//         // Check if the article already exists by name (or slug)
//         const existingArticle = await this.prisma.article.findUnique({
//             where: { slug },
//         });
//
//         if (existingArticle) {
//             throw new InternalServerErrorException('مقاله‌ای با این نام وجود داشته است');
//         }
//
//         const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`);
//
//         const articleCategoryConnect = articleCategoryIds?.length
//             ? { connect: articleCategoryIds.map((id) => ({ id })) }
//             : undefined;
//
//         const colorConnect = colorIds?.length
//             ? { connect: colorIds.map((id) => ({ id })) }
//             : undefined;
//
//         const tagsConnect = tagIds?.length
//             ? { connect: tagIds.map((id) => ({ id })) }
//             : undefined;
//
//         try {
//             return await this.prisma.article.create({
//                 data: {
//                     ...articleData,
//                     slug, // Add slug field
//                     price: price || null,
//                     inventory: inventory || null,
//                     categories: articleCategoryConnect,
//                     colors: colorConnect,
//                     tags: tagsConnect, // Connect tags
//                     photos: {
//                         create: photoUrls?.map((url) => ({ url })),
//                     },
//                     brandId: brandId || null, // Make sure brandId is passed as a number
//                 },
//                 include: { categories: true, colors: true, brand: true, photos: true, tags: true },
//             });
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در ایجاد مقاله', error.message);
//         }
//     }
//
//     // گرفتن تمامی مقالات با فیلتر، صفحه‌بندی و مرتب‌سازی
//     async findAll(
//         page: number = 1,
//         limit: number = 10,
//         articleCategoryIds?: string,
//         colorIds?: string,
//         brandId?: string,
//         minPrice?: number,
//         maxPrice?: number,
//         sortBy: string = 'createdAt',
//         sort: 'asc' | 'desc' = 'asc',
//     ) {
//         const articleCategoryIdsArray = articleCategoryIds ? articleCategoryIds.split(',').map(Number) : undefined;
//         const colorIdsArray = colorIds ? colorIds.split(',').map(Number) : undefined;
//         const brandIdNumber = brandId ? Number(brandId) : undefined;
//
//         const where: Prisma.ArticleWhereInput = {
//             isDeleted: false,
//             categories: articleCategoryIdsArray
//                 ? { some: { id: { in: articleCategoryIdsArray } } }
//                 : undefined,
//             colors: colorIdsArray?.length
//                 ? { some: { id: { in: colorIdsArray } } }
//                 : undefined,
//             brandId: brandIdNumber || undefined,
//             price: minPrice || maxPrice
//                 ? { gte: minPrice, lte: maxPrice }
//                 : undefined,
//             isPublished: true,
//         };
//
//         if (sort === 'desc') {
//             const fiveHoursAgo = new Date();
//             fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 24);
//
//             where.createdAt = {
//                 gte: fiveHoursAgo,
//             };
//             limit = 15;
//         }
//
//         try {
//             return await this.prisma.article.findMany({
//                 where,
//                 skip: (page - 1) * limit,
//                 take: limit,
//                 orderBy: {
//                     [sortBy]: sort,
//                 },
//                 include: {
//                     categories: true,
//                     colors: true,
//                     brand: true,
//                     photos: true,
//                     tags: true, // گنجاندن برچسب‌ها در نتیجه
//                 },
//             });
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در دریافت مقالات', error.message);
//         }
//     }
//
//     // دریافت یک مقاله با شناسه یا slug
//     async findOne(identifier: string | number) {
//         const isNumeric = !isNaN(Number(identifier));
//
//         const where: Prisma.ArticleWhereUniqueInput = isNumeric
//             ? { id: Number(identifier) }  // اگر عددی بود از 'id' استفاده کن
//             : { slug: String(identifier) };  // اگر string بود از 'slug' استفاده کن
//
//         try {
//             const article = await this.prisma.article.findUnique({
//                 where,
//                 include: {
//                     categories: true,
//                     colors: true,
//                     brand: true,
//                     photos: true,
//                     tags: true, // گنجاندن برچسب‌ها در نتیجه
//                 },
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${identifier} یافت نشد`);
//             }
//
//             return article;
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در دریافت مقاله', error.message);
//         }
//     }
//
//     // یافتن مقاله با شناسه یا slug
//     async findArticleByIdentifier(identifier: string) {
//         const isNumeric = !isNaN(Number(identifier));
//
//         const where: Prisma.ArticleWhereUniqueInput =
//             isNumeric
//                 ? { id: Number(identifier) }  // اگر عددی بود از 'id' استفاده کن
//                 : { slug: identifier };        // اگر string بود از 'slug' استفاده کن
//
//         try {
//             const article = await this.prisma.article.findUnique({
//                 where,
//                 include: {
//                     categories: true,
//                     colors: true,
//                     brand: true,
//                     photos: true,
//                     tags: true,
//                 },
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${identifier} یافت نشد`);
//             }
//
//             return article;
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در دریافت مقاله', error.message);
//         }
//     }
//
//     // به‌روزرسانی مقاله موجود با داده‌ها و تصاویر جدید
//     async update(identifier: string | number, updateArticleDto: UpdateArticleDto, photos: Array<Express.Multer.File>) {
//         const { articleCategoryIds, colorIds, tagIds, name, ...articleData } = updateArticleDto;
//
//         const slug = name ? slugify(name) : undefined;
//
//         const photoUrls = photos?.map(photo => `/uploads/photos/${photo.filename}`) || [];
//
//         const articleCategoryConnect = articleCategoryIds?.length
//             ? { connect: articleCategoryIds.map((id) => ({ id })) }
//             : undefined;
//
//         const colorConnect = colorIds?.length
//             ? { connect: colorIds.map((id) => ({ id })) }
//             : undefined;
//
//         const tagsConnect = tagIds?.length
//             ? { connect: tagIds.map((id) => ({ id })) }
//             : undefined;
//
//         const photoData = photoUrls.length > 0
//             ? { create: photoUrls.map((url) => ({ url })) }
//             : undefined;
//
//         const where: Prisma.ArticleWhereUniqueInput =
//             typeof identifier === 'number'
//                 ? { id: identifier }
//                 : { slug: identifier };
//
//         try {
//             const article = await this.prisma.article.update({
//                 where,
//                 data: {
//                     ...articleData,
//                     slug, // فیلد slug به‌روز شده
//                     categories: articleCategoryConnect,
//                     colors: colorConnect,
//                     tags: tagsConnect ? { connect: tagsConnect.connect } : undefined,
//                     photos: photoData,
//                 },
//                 include: {
//                     categories: true,
//                     colors: true,
//                     brand: true,
//                     photos: true,
//                     tags: true, // گنجاندن برچسب‌ها در نتیجه
//                 },
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${identifier} یافت نشد`);
//             }
//
//             return article;
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در به‌روزرسانی مقاله', error.message);
//         }
//     }
//
//     // حذف تمامی تصاویر یک مقاله با شناسه
//     async deleteAllPhotosByArticleIdentifier(identifier: string) {
//         try {
//             const articleId = isNaN(Number(identifier)) ? identifier : Number(identifier);
//
//             let numericArticleId: number;
//
//             if (typeof articleId === 'string') {
//                 const article = await this.prisma.article.findUnique({
//                     where: { slug: articleId },
//                     select: { id: true },
//                 });
//
//                 if (!article) {
//                     throw new NotFoundException(`مقاله با slug ${articleId} یافت نشد`);
//                 }
//
//                 numericArticleId = article.id;
//             } else {
//                 numericArticleId = articleId;
//             }
//
//             const deleted = await this.prisma.photo.deleteMany({
//                 where: {
//                     articleId: numericArticleId,
//                 },
//             });
//
//             if (deleted.count === 0) {
//                 throw new NotFoundException(`هیچ عکسی برای مقاله با شناسه ${identifier} پیدا نشد`);
//             }
//
//             return deleted.count;
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در حذف تصاویر', error.message);
//         }
//     }
//
//     // حذف مقاله و تصاویر مربوطه
//     async deleteArticleAndPhotos(identifier: string) {
//         try {
//             const articleId = isNaN(Number(identifier)) ? identifier : Number(identifier);
//
//             const whereCondition: Prisma.ArticleWhereUniqueInput = isNaN(Number(identifier))
//                 ? { slug: identifier }
//                 : { id: Number(identifier) };
//
//             const article = await this.prisma.article.findUnique({
//                 where: whereCondition,
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${identifier} یافت نشد`);
//             }
//
//             return this.prisma.$transaction(async (transaction) => {
//                 await transaction.photo.deleteMany({
//                     where: { articleId: Number(article.id) },
//                 });
//
//                 return transaction.article.delete({
//                     where: { id: Number(article.id) },
//                 });
//             });
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در حذف مقاله و تصاویر مربوطه', error.message);
//         }
//     }
//
//     // حذف یک تصویر خاص از یک مقاله
//     async deletePhoto(articleId: number, photoId: number) {
//         try {
//             const article = await this.prisma.article.findUnique({
//                 where: { id: articleId },
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${articleId} یافت نشد`);
//             }
//
//             const photo = await this.prisma.photo.findUnique({
//                 where: { id: photoId },
//             });
//
//             if (!photo || photo.articleId !== articleId) {
//                 throw new NotFoundException(`تصویر با شناسه ${photoId} برای این مقاله یافت نشد`);
//             }
//
//             return this.prisma.photo.delete({
//                 where: { id: photoId },
//             });
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در حذف تصویر', error.message);
//         }
//     }
//
//     // دریافت تمامی تصاویر یک مقاله با شناسه مقاله
//     async getPhotosByArticleId(articleId: number) {
//         try {
//             const article = await this.prisma.article.findUnique({
//                 where: { id: articleId },
//                 include: { photos: true },
//             });
//
//             if (!article) {
//                 throw new NotFoundException(`مقاله با شناسه ${articleId} یافت نشد`);
//             }
//
//             return article.photos;
//         } catch (error) {
//             throw new InternalServerErrorException('خطا در دریافت تصاویر مقاله', error.message);
//         }
//     }
// }
