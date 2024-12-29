import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleCategory } from '@prisma/client';
import {CreateCategoryDto} from "../categories/dto/create-category.dto";
import {UpdateCategoryDto} from "../categories/dto/update-category.dto";

@Injectable()
export class ArticleCategoriesService {
  private updateCategoryDto: any;
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { categoryName, categoryDescription, parentId, children } = createCategoryDto;

    // Check if a category with the same name already exists
    const existingCategory = await this.prisma.articleCategory.findUnique({
      where: { categoryName },
    });
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists.');
    }

    // Create the main category
    const category = await this.prisma.articleCategory.create({
      data: { categoryName, categoryDescription, parentId },
    });

    // If children exist, create them recursively
    if (children && children.length > 0) {
      await Promise.all(
          children.map((child) => {
            // Pass the child data to create them recursively
            return this.create({
              ...child,
              parentId: category.id, // Ensure child categories have the parentId set to the parent category's id
            });
          }),
      );
    }

    return this.findOne(category.id); // Return the newly created category with children
  }

  async findDescendants(categoryId: number): Promise<ArticleCategory[]> {
    const descendants = await this.prisma.articleCategory.findMany({
      where: { parentId: categoryId },
    });

    if (descendants.length === 0) {
      throw new NotFoundException('No descendants found for this category');
    }

    const allDescendants = [];
    for (const child of descendants) {
      allDescendants.push(child);
      const childDescendants = await this.findDescendants(child.id);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }

  async findAll() {
    return this.prisma.articleCategory.findMany({
      include: { children: true },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findChild(parentId: number, childId: number) {
    // Find the parent category
    const parentCategory = await this.prisma.articleCategory.findUnique({
      where: { id: parentId },
      include: { children: true }, // Include children in the result
    });

    if (!parentCategory) {
      throw new Error('Parent category not found');
    }

    // Find the specific child category from the parent's children
    const childCategory = parentCategory.children.find((child) => child.id === childId);

    if (!childCategory) {
      throw new Error('Child category not found under the specified parent');
    }

    return childCategory;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { children, ...data } = updateCategoryDto;

    // Find the existing category
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Update the category
    await this.prisma.articleCategory.update({
      where: { id },
      data,
    });

    // Handle children updates recursively
    if (children && children.length > 0) {
      await Promise.all(
          children.map(async (child) => {
            // Check if child is of type UpdateCategoryDto (i.e., has 'id' property)
            if ((child as UpdateCategoryDto).id && typeof (child as UpdateCategoryDto).id === 'number') {
              // Update existing child if 'id' is available
              await this.update((child as UpdateCategoryDto).id, child as UpdateCategoryDto);
            } else {
              // Create new child if 'id' is not available (this is for new categories)
              await this.create({ ...child, parentId: id });
            }
          }),
      );
    }

    return this.findOne(id); // Return the updated category with children
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category does not exist!');
    }
    // Perform a soft delete by setting `isDeleted` to true
    return this.prisma.articleCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
