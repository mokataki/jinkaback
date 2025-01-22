import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import slugify from '@sindresorhus/slugify'; // Import slugify

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to generate slug from category name
  private generateSlug(categoryName: string): string {
    if (!categoryName) {
      throw new BadRequestException('نام دسته‌بندی باید برای تولید slug وارد شود.');
    }
    return slugify(categoryName);
  }

  // Create a new category
  async create(createCategoryDto: CreateCategoryDto) {
    const { categoryName, categoryDescription, parentId, children } = createCategoryDto;

    // Generate slug from categoryName using slugify
    const slug = this.generateSlug(categoryName);

    // Check if a category with the same name already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { categoryName },
    });
    if (existingCategory) {
      throw new BadRequestException('دسته‌بندی با این نام قبلاً موجود است.');
    }

    // Check if a category with the same slug already exists (optional)
    const existingSlugCategory = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlugCategory) {
      throw new BadRequestException('دسته‌بندی با این slug قبلاً موجود است.');
    }

    // Create the main category
    const category = await this.prisma.category.create({
      data: {
        categoryName,
        categoryDescription,
        parentId: parentId || null,  // Ensure parentId can be null
        slug, // Use generated slug
      },
    });

    // If children exist, create them recursively
    if (children && children.length > 0) {
      await Promise.all(
          children.map((child) => {
            return this.create({
              ...child,
              parentId: category.id, // Ensure child categories have the parentId set to the parent category's id
            });
          }),
      );
    }

    return this.findOne(category.id); // Return the newly created category with children
  }

  // Find descendants of a category by identifier
  async findDescendants(categoryIdentifier: string | number): Promise<Category[]> {
    const category = await this.findCategoryByIdentifier(categoryIdentifier);

    const descendants = await this.prisma.category.findMany({
      where: { parentId: category.id },
    });

    if (descendants.length === 0) {
      throw new NotFoundException('هیچ زیرمجموعه‌ای برای این دسته‌بندی پیدا نشد.');
    }

    const allDescendants = [];
    for (const child of descendants) {
      allDescendants.push(child);
      const childDescendants = await this.findDescendants(child.id);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }

  // Find all categories
  async findAll() {
    return this.prisma.category.findMany({
      include: { children: true },
    });
  }

  // Find category by ID or slug
  async findCategoryByIdentifier(identifier: string | number) {
    const isNumeric = !isNaN(Number(identifier));

    if (isNumeric) {
      return this.findOneById(parseInt(identifier as string));
    } else {
      return this.findBySlug(identifier as string);
    }
  }

  // Find category by ID
  async findOneById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }
    return category;
  }

  // Find category by slug
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }
    return category;
  }

  // Find category by id or slug
  async findOne(identifier: string | number) {
    return this.findCategoryByIdentifier(identifier);
  }

  // Find a child category by parentId and childId
  async findChild(parentId: number, childId: number) {
    const parentCategory = await this.prisma.category.findUnique({
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

  // Update category by ID or slug
  async update(identifier: string, updateCategoryDto: UpdateCategoryDto) {
    const isNumeric = !isNaN(Number(identifier)); // Check if the identifier is numeric
    const { children, ...data } = updateCategoryDto;

    let category;
    if (isNumeric) {
      category = await this.findOneById(parseInt(identifier)); // If numeric, find by ID
    } else {
      category = await this.findBySlug(identifier); // If slug, find by slug
    }

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }

    // Update the category
    await this.prisma.category.update({
      where: { id: category.id },
      data,
    });

    // Handle children updates recursively
    if (children && children.length > 0) {
      await Promise.all(
          children.map(async (child) => {
            if ((child as UpdateCategoryDto).id) {
              await this.update((child as UpdateCategoryDto).id.toString(), child as UpdateCategoryDto); // Ensure ID is passed as string
            } else {
              await this.create({ ...child, parentId: category.id });
            }
          }),
      );
    }

    return this.findOne(category.id); // Return the updated category
  }

  // Remove a category by identifier
  async remove(identifier: string | number) {
    const category = await this.findCategoryByIdentifier(identifier);

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد.');
    }

    // Perform a soft delete by setting `isDeleted` to true
    return this.prisma.category.delete({
      where: { id: category.id },
    });
  }
}
