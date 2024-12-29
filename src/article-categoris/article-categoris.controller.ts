import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import {ArticleCategoriesService} from "./article-categoris.service";
import {CreateArticleCategoryDto} from "./dto/create-article-categoris.dto";
import {UpdateArticleCategoryDto} from "./dto/update-article-categoris.dto";

@Controller('article-categories')
export class ArticleCategoriesController {
  constructor(private readonly articleCategoriesService: ArticleCategoriesService) {}

  // Create a new category
  @Post()
  async create(@Body() createArticleCategoryDto: CreateArticleCategoryDto) {
    return this.articleCategoriesService.create(createArticleCategoryDto);
  }

  // Get all categories
  @Get()
  async findAll() {
    return this.articleCategoriesService.findAll();
  }

  // Get a single category by ID
  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return this.articleCategoriesService.findOne(id);
  }

  // Get all descendants (children, grandchildren, etc.) of a category
  @Get(':id/descendants')
  async findDescendants(@Param('id',ParseIntPipe) id: number) {
    return this.articleCategoriesService.findDescendants(id);
  }

  // Get a specific child of a parent category
  @Get(':parentId/children/:childId')
  async findChild(
      @Param('parentId') parentId: number,
      @Param('childId') childId: number,
  ) {
    return this.articleCategoriesService.findChild(parentId, childId);
  }

  // Update an existing category
  @Patch(':id')
  async update(
      @Param('id',ParseIntPipe) id: number,
      @Body() updateArticleCategoryDto: UpdateArticleCategoryDto,
  ) {
    return this.articleCategoriesService.update(id, updateArticleCategoryDto);
  }

  // Soft delete a category
  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    return this.articleCategoriesService.remove(id);
  }
}
