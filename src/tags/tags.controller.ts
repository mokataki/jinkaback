import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // Create a new tag
  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  // Get all tags with pagination, filtering, and hierarchy options
  @Get()
  findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('search') search?: string,
      @Query('parentId') parentId?: number,
  ) {
    return this.tagsService.findAllWithPagination(page, limit, search, parentId);
  }

  // Get a single tag by ID or slug
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    try {
      return this.tagsService.findTagByIdentifier(identifier);
    } catch (error) {
      throw new BadRequestException('برچسب پیدا نشد');
    }
  }

  // Update an existing tag using identifier (ID or slug)
  @Patch(':identifier')
  async update(
      @Param('identifier') identifier: string,
      @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(identifier, updateTagDto);
  }

  // Permanently delete a tag using identifier (ID or slug)
  @Delete(':identifier')
  async delete(@Param('identifier') identifier: string) {
    return this.tagsService.remove(identifier);
  }
}
