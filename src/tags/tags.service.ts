import {Injectable, NotFoundException, BadRequestException, ConflictException} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from "../../prisma/prisma.service";
import slugify from "@sindresorhus/slugify";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag
  // Create a new tag
  async create(createTagDto: CreateTagDto) {
    const { parentId, ...rest } = createTagDto;
    const slug = slugify(rest.name, { lower: true } as any); // Generate slug from name

    try {
      // Check if a tag with the same name already exists
      const existingTag = await this.prisma.tags.findUnique({
        where: { name: rest.name }
      });

      if (existingTag) {
        throw new ConflictException('برچسب با این نام قبلاً ایجاد شده است');
      }

      // If parentId is provided, validate it
      let parent = null;
      if (parentId) {
        parent = await this.prisma.tags.findUnique({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException('برچسب والد پیدا نشد');
        }
      }

      return this.prisma.tags.create({
        data: {
          ...rest,
          slug,
          parentId: parentId ?? null,
        },
      });
    } catch (error) {
      console.error('Error during tag creation:', error); // Log error details
      if (error instanceof ConflictException) {
        throw error; // If it's a conflict error, propagate it
      }
      throw new BadRequestException('خطا در ایجاد برچسب');
    }
  }

  // Get tags with pagination, filtering, and hierarchy options
  async findAll(searchQuery: string, parentId?: number, pagination?: { skip?: number; take?: number }) {
    try {
      const where: Prisma.tagsWhereInput = {
        isDeleted: false,
        name: {
          contains: searchQuery,
          mode: Prisma.QueryMode.insensitive, // Case-insensitive search
        },
        ...(parentId ? { parentId } : {}),
      };

      const tags = await this.prisma.tags.findMany({
        where,
        skip: pagination?.skip,
        take: pagination?.take,
        orderBy: { createdAt: 'desc' },
      });

      const count = await this.prisma.tags.count({ where });

      return { tags, count };
    } catch (error) {
      throw new BadRequestException('خطا در دریافت برچسب‌ها');
    }
  }

  // Get tags with pagination, search, and parentId filter
  async findAllWithPagination(page: number, limit: number, searchQuery: string, parentId?: number) {
    const pagination = {
      skip: (page - 1) * limit,
      take: limit,
    };

    return this.findAll(searchQuery, parentId, pagination);
  }

  // Get tag by ID or slug (refactored logic moved here)
  async findTagByIdentifier(identifier: string) {
    const isNumeric = !isNaN(Number(identifier));

    if (isNumeric) {
      const parsedId = parseInt(identifier);
      return this.findOneById(parsedId); // Find by ID if numeric
    }

    return this.findBySlug(identifier); // Otherwise, find by slug
  }

  // Get tag by ID
  async findOneById(id: number) {
    const tag = await this.prisma.tags.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });

    if (!tag || tag.isDeleted) {
      throw new NotFoundException('برچسب پیدا نشد');
    }

    return tag;
  }

  // Get tag by slug
  async findBySlug(slug: string) {
    const tag = await this.prisma.tags.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    });

    if (!tag || tag.isDeleted) {
      throw new NotFoundException('برچسب پیدا نشد');
    }

    return tag;
  }

  // Update tag by ID
  async update(identifier: string, updateTagDto: UpdateTagDto) {
    const isNumeric = !isNaN(Number(identifier));
    const { parentId, name, ...updateData } = updateTagDto;
    const slug = slugify(name, { lower: true } as any);

    try {
      let currentTag;

      // If it's numeric, search by ID, otherwise search by slug
      if (isNumeric) {
        currentTag = await this.prisma.tags.findUnique({
          where: { id: Number(identifier) },
        });
      } else {
        currentTag = await this.prisma.tags.findUnique({
          where: { slug: identifier },
        });
      }

      if (!currentTag || currentTag.isDeleted) {
        throw new NotFoundException('برچسب پیدا نشد');
      }

      // Validate parentId if provided
      if (parentId) {
        const parent = await this.prisma.tags.findUnique({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException('برچسب والد پیدا نشد');
        }
      }

      return this.prisma.tags.update({
        where: { id: currentTag.id },
        data: {
          ...updateData,
          parentId: parentId ?? null,
          name,
          slug,
        },
      });
    } catch (error) {
      throw new BadRequestException('خطا در به‌روزرسانی برچسب');
    }
  }

  // Delete a tag
  async remove(identifier: string) {
    const isNumeric = !isNaN(Number(identifier));

    try {
      let tag;

      // If it's numeric, search by ID, otherwise search by slug
      if (isNumeric) {
        tag = await this.prisma.tags.findUnique({ where: { id: Number(identifier) } });
      } else {
        tag = await this.prisma.tags.findUnique({ where: { slug: identifier } });
      }

      if (!tag || tag.isDeleted) {
        throw new NotFoundException('برچسب پیدا نشد');
      }

      await this.prisma.$transaction(async (transaction) => {
        await transaction.tags.deleteMany({ where: { parentId: tag.id } });
        await transaction.tags.delete({ where: { id: tag.id } });
      });

      return { message: 'برچسب با موفقیت حذف شد' };
    } catch (error) {
      throw new BadRequestException('خطا در حذف برچسب');
    }
  }
}
