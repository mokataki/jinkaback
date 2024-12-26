import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  // Find a single photo by its ID
  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: string) {
    return this.photosService.findOne(+id);  // Assuming ID is a number
  }

  // Update a photo by its ID
  @Patch(':id')
  async update(
      @Param('id',ParseIntPipe) id: string,
      @Body() updatePhotoDto: UpdatePhotoDto
  ) {
    return this.photosService.update(+id, updatePhotoDto);
  }

  // Delete a photo by its ID
  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: string) {
    return this.photosService.remove(+id);
  }
}
