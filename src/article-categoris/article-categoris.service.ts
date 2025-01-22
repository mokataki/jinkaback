import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleCategory } from '@prisma/client';
import { CreateCategoryDto } from "../categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../categories/dto/update-category.dto";
import slugify from "@sindresorhus/slugify";

@Injectable()
export class ArticleCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // تابع برای تولید slug از نام دسته بندی
  private generateSlug(categoryName: string): string {
    if (!categoryName) {
      throw new BadRequestException('نام دسته‌بندی باید برای تولید slug وارد شود.');
    }
    return slugify(categoryName);
  }

  // بررسی اینکه آیا شناسه عددی (ID) است یا متنی (slug)
  private isNumeric(identifier: string): boolean {
    return !isNaN(Number(identifier));
  }

  // ایجاد یک دسته‌بندی جدید
  async create(createCategoryDto: CreateCategoryDto) {
    const { categoryName, categoryDescription, parentId, children } = createCategoryDto;
    const slug = this.generateSlug(categoryName);

    // بررسی اینکه آیا دسته‌بندی با همان نام قبلاً وجود دارد یا خیر
    const existingCategory = await this.prisma.articleCategory.findUnique({
      where: { categoryName },
    });
    if (existingCategory) {
      throw new BadRequestException('دسته‌بندی با این نام قبلاً موجود است.');
    }

    // بررسی اینکه آیا دسته‌بندی با همان slug قبلاً وجود دارد یا خیر
    const existingSlugCategory = await this.prisma.articleCategory.findUnique({
      where: { slug },
    });
    if (existingSlugCategory) {
      throw new BadRequestException('دسته‌بندی با این slug قبلاً موجود است.');
    }

    // ایجاد دسته‌بندی اصلی با slug معتبر
    const category = await this.prisma.articleCategory.create({
      data: {
        categoryName,
        categoryDescription,
        parentId: parentId ?? null,
        slug,
      },
    });

    // اگر دسته‌های فرعی (children) وجود داشته باشند، به صورت بازگشتی ایجاد می‌شوند
    if (children && children.length > 0) {
      await this.createChildren(category.id, children);
    }

    return this.findOne(category.id); // بازگشت دسته‌بندی جدید به همراه زیرمجموعه‌ها
  }

  // تابع برای ایجاد دسته‌های فرعی به صورت بازگشتی
  private async createChildren(parentId: number, children: CreateCategoryDto[]) {
    await Promise.all(
        children.map((child) => {
          return this.create({
            ...child,
            parentId, // مشخص کردن parentId برای دسته‌های فرعی
          });
        }),
    );
  }

  // پیدا کردن دسته‌بندی بر اساس شناسه یا slug
  async findCategoryByIdentifier(identifier: string) {
    if (this.isNumeric(identifier)) {
      return this.findOneById(Number(identifier)); // اگر عددی باشد، بر اساس ID پیدا می‌شود
    } else {
      return this.findBySlug(identifier); // در غیر این صورت، بر اساس slug پیدا می‌شود
    }
  }

  // پیدا کردن دسته‌بندی بر اساس شناسه (ID)
  async findOneById(id: number) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }
    return category;
  }

  // پیدا کردن دسته‌بندی بر اساس slug
  async findBySlug(slug: string) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { slug },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }
    return category;
  }

  // پیدا کردن زیرمجموعه‌ها (descendants) برای یک دسته‌بندی
  async findDescendants(categoryId: number): Promise<ArticleCategory[]> {
    const descendants = await this.prisma.articleCategory.findMany({
      where: { parentId: categoryId },
    });

    if (descendants.length === 0) {
      throw new NotFoundException('زیرمجموعه‌ای برای این دسته‌بندی پیدا نشد.');
    }

    const allDescendants = [];
    for (const child of descendants) {
      allDescendants.push(child);
      const childDescendants = await this.findDescendants(child.id);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }

  // پیدا کردن تمام دسته‌بندی‌ها
  async findAll() {
    return this.prisma.articleCategory.findMany({
      include: { children: true },
    });
  }

  // پیدا کردن یک دسته‌بندی خاص
  async findOne(id: number) {
    return this.findOneById(id);
  }

  // پیدا کردن یک دسته‌بندی فرزند
  async findChild(parentId: number, childId: number) {
    const parentCategory = await this.prisma.articleCategory.findUnique({
      where: { id: parentId },
      include: { children: true },
    });

    if (!parentCategory) {
      throw new NotFoundException('دسته‌بندی والد پیدا نشد.');
    }

    const childCategory = parentCategory.children.find((child) => child.id === childId);

    if (!childCategory) {
      throw new NotFoundException('دسته‌بندی فرزند پیدا نشد.');
    }

    return childCategory;
  }

  // به‌روزرسانی یک دسته‌بندی
  async update(identifier: string, updateCategoryDto: UpdateCategoryDto) {
    const { children, ...data } = updateCategoryDto;

    // پیدا کردن دسته‌بندی موجود
    const category = await this.findCategoryByIdentifier(identifier);

    // به‌روزرسانی دسته‌بندی
    await this.prisma.articleCategory.update({
      where: { id: category.id },
      data,
    });

    // به‌روزرسانی دسته‌های فرعی به صورت بازگشتی
    if (children && children.length > 0) {
      await Promise.all(
          children.map(async (child) => {
            if ((child as UpdateCategoryDto).id) {
              await this.update((child as UpdateCategoryDto).id.toString(), child as UpdateCategoryDto);
            } else {
              await this.create({ ...child, parentId: category.id });
            }
          }),
      );
    }

    return this.findOne(category.id); // بازگشت دسته‌بندی به‌روزرسانی شده
  }

  // حذف یک دسته‌بندی
  async remove(identifier: string) {
    const category = await this.findCategoryByIdentifier(identifier);

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد.');
    }

    // بررسی اینکه آیا دسته‌بندی زیرمجموعه‌ها دارد یا خیر
    const descendants = await this.prisma.articleCategory.findMany({
      where: { parentId: category.id },
    });

    if (descendants.length > 0) {
      throw new BadRequestException('دسته‌بندی دارای زیرمجموعه است و نمی‌توان آن را حذف کرد.');
    }

    // حذف دسته‌بندی
    return this.prisma.articleCategory.delete({
      where: { id: category.id },
    });
  }
}
