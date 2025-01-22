import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateCategoryDto } from "../categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../categories/dto/update-category.dto";
import {ArticleCategoriesService} from "./article-categoris.service";

@Controller('article-categories')
export class ArticleCategoriesController {
  constructor(private readonly articleCategoriesService: ArticleCategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.articleCategoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return this.articleCategoriesService.findAll();
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.articleCategoriesService.findCategoryByIdentifier(identifier); // Using string identifier
  }

  @Get(':parentId/children/:childId')
  async findChild(
      @Param('parentId', ParseIntPipe) parentId: number,
      @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.articleCategoriesService.findChild(parentId, childId);
  }

  @Patch(':identifier')
  async update(
      @Param('identifier') identifier: string, // Accept string identifier (could be ID or slug)
      @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.articleCategoriesService.update(identifier, updateCategoryDto); // Passing string identifier
  }

  @Delete(':identifier')
  async remove(@Param('identifier') identifier: string) {
    return this.articleCategoriesService.remove(identifier); // Passing string identifier
  }
}
