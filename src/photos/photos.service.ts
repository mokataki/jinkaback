// src/photos/photos.service.ts
import { Injectable } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto';
import {PrismaService} from "../../prisma/prisma.service";
import {UpdatePhotoDto} from "./dto/update-photo.dto";

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(createPhotoDto: CreatePhotoDto) {
    return this.prisma.photo.create({
      data: createPhotoDto,
    });
  }

  async deletePhotoById(photoId: number) {
    return this.prisma.photo.delete({
      where: { id: photoId },
    });
  }

  // In your PhotosService or relevant service
  async deleteAllPhotosByProductId(productId: number): Promise<number> {
    const deleted = await this.prisma.photo.deleteMany({
      where: { productId },
    });

    if (deleted.count === 0) {
      throw new Error('No photos found for this product');
    }

    return deleted.count; // Return the number of deleted photos
  }

  async findAll() {
    return this.prisma.photo.findMany();
  }



  async findByProductId(productId: number) {
    return this.prisma.photo.findMany({
      where: { productId },
    });
  }
  // Find one photo by ID
  async findOne(id: number) {
    return this.prisma.photo.findUnique({
      where: { id },
    });
  }

  // Update a photo (for example, updating the URL)
  async update(id: number, updatePhotoDto: UpdatePhotoDto) {
    return this.prisma.photo.update({
      where: { id },
      data: updatePhotoDto,  // Ensure UpdatePhotoDto has necessary fields (like `url` for updating the photo URL)
    });
  }

  // Remove a photo by ID
  async remove(id: number) {
    return this.prisma.photo.delete({
      where: { id },
    });
  }


}
