import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.categoriesService.findCategoryByIdentifier(identifier); // Using string identifier
  }

  @Get(':parentId/children/:childId')
  async findChild(
      @Param('parentId', ParseIntPipe) parentId: number,
      @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.categoriesService.findChild(parentId, childId);
  }

  @Patch(':identifier')
  async update(
      @Param('identifier') identifier: string, // Accept string identifier (could be ID or slug)
      @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(identifier, updateCategoryDto); // Passing string identifier
  }

  @Delete(':identifier')
  async remove(@Param('identifier') identifier: string) { // Accept string identifier (could be ID or slug)
    return this.categoriesService.remove(identifier); // Passing string identifier
  }
}
