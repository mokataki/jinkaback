import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // Create a new brand
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  // Get all brands
  @Get()
  async findAll() {
    return this.brandsService.findAll();
  }

  // Find a brand by ID or slug
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.brandsService.findBrandByIdentifier(identifier); // Passing slug or ID as identifier
  }

  // Update a brand by ID or slug
  @Patch(':identifier')
  async update(
      @Param('identifier') identifier: string,  // Accept slug or ID as identifier
      @Body() updateBrandDto: UpdateBrandDto
  ) {
    return this.brandsService.update(identifier, updateBrandDto);
  }

  // Remove a brand by ID or slug
  @Delete(':identifier')
  async remove(@Param('identifier') identifier: string) {
    return this.brandsService.remove(identifier);  // Pass slug or ID as identifier
  }
}
