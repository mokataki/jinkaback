import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
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

  // Get a single tag by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  // Update an existing tag
  @Patch(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  // Soft delete a tag
  // @Patch(':id/soft-delete')
  // softDelete(@Param('id', ParseIntPipe) id: number) {
  //   return this.tagsService.softDelete(id);
  // }

  // Permanently delete a tag
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
