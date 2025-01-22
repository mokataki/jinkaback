import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  // Create a new color
  @Post()
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  }

  // Get all colors
  @Get()
  findAll() {
    return this.colorsService.findAll();
  }

  // Find a color by ID or slug
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.colorsService.findOne(identifier); // Pass identifier (either ID or slug)
  }

  // Update a color by ID or slug
  @Patch(':identifier')
  update(
      @Param('identifier') identifier: string, // Accept identifier (either ID or slug)
      @Body() updateColorDto: UpdateColorDto
  ) {
    return this.colorsService.update(identifier, updateColorDto);
  }

  // Soft delete a color by ID or slug
  @Delete(':identifier')
  remove(@Param('identifier') identifier: string) {
    return this.colorsService.remove(identifier);  // Pass identifier (either ID or slug)
  }
}
