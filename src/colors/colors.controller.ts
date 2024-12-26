// src/colors/colors.controller.ts
import {Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe} from '@nestjs/common';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  findAll() {
    return this.colorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.colorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateColorDto: UpdateColorDto) {
    return this.colorsService.update(id, updateColorDto);
  }

  @Delete('delete/:id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.colorsService.remove(id);
  }
}
