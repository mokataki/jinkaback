import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    const { parentId, ...rest } = createTagDto;

    try {
      // Handle parent tag if provided
      let parent = null;
      if (parentId) {
        parent = await this.prisma.tags.findUnique({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException('Parent tag not found');
        }
      }

      return this.prisma.tags.create({
        data: {
          ...rest,
          parentId: parentId ?? null,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create tag');
    }
  }

  async findAll(searchQuery: string, parentId?: number, pagination?: { skip?: number; take?: number }) {
    try {
      const where: Prisma.tagsWhereInput = {
        isDeleted: false,
        name: {
          contains: searchQuery,
          mode: Prisma.QueryMode.insensitive, // Case-insensitive search
        },
        ...(parentId ? { parentId } : {}), // Include parentId filter if provided
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
      throw new BadRequestException('Failed to retrieve tags');
    }
  }

  async findAllWithPagination(page: number, limit: number, searchQuery: string, parentId?: number) {
    const pagination = {
      skip: (page - 1) * limit,
      take: limit,
    };

    return this.findAll(searchQuery, parentId, pagination);
  }

  async findOne(id: number) {
    try {
      const tag = await this.prisma.tags.findUnique({
        where: { id },
        include: { children: true, parent: true },
      });

      if (!tag || tag.isDeleted) {
        throw new NotFoundException('Tag not found');
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve tag');
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const { parentId, name, ...updateData } = updateTagDto;

    try {
      // Fetch the current tag to check its existing name
      const currentTag = await this.prisma.tags.findUnique({
        where: { id },
      });

      if (!currentTag || currentTag.isDeleted) {
        throw new NotFoundException('Tag not found');
      }

      // If the name is provided and it is different from the current name, perform a uniqueness check
      if (name && name !== currentTag.name) {
        const existingTag = await this.prisma.tags.findUnique({
          where: { name },
        });

        // If another tag with the same name exists and it is not the tag being updated, throw an error
        if (existingTag && existingTag.id !== id) {
          throw new BadRequestException('Tag with this name already exists');
        }
      }

      // Validate parentId if provided
      if (parentId) {
        const parent = await this.prisma.tags.findUnique({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException('Parent tag not found');
        }
      }

      // Update the tag with the new data
      return this.prisma.tags.update({
        where: { id },
        data: {
          ...updateData,
          parentId: parentId ?? null,
          name,  // Update the name if it's provided
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handling unique constraint violation error or other Prisma-specific errors
        if (error.code === 'P2002') {
          throw new BadRequestException('Unique constraint failed');
        }
      }
      throw new BadRequestException('Failed to update tag');
    }
  }

  async remove(id: number) {
    try {
      const tag = await this.prisma.tags.findUnique({ where: { id } });
      if (!tag || tag.isDeleted) {
        throw new NotFoundException('Tag not found');
      }

      // Soft delete tag and its children
      await this.prisma.$transaction(async (transaction) => {
        await transaction.tags.deleteMany({ where: { parentId: id } });
        await transaction.tags.delete({ where: { id } });
      });

      return { message: 'Tag deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete tag');
    }
  }
}
