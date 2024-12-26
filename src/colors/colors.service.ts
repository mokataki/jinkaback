// src/colors/colors.service.ts
import {BadRequestException, Injectable} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class ColorsService {
  constructor(private prisma: PrismaService) {}

  async findOneByName(color: string) {
    return this.prisma.color.findUnique({
      where: { color },  // Find by color name
    });
  }

  // Create a new color
  async create(createColorDto: CreateColorDto) {
    // Check if a color with the same name already exists
    const existingColour = await this.findOneByName(createColorDto.color);

    // If the color exists, throw a BadRequestException
    if (existingColour) {
      throw new BadRequestException('Colour already exists!');
    }

    // If the color does not exist, create a new color entry
    const color = await this.prisma.color.create({
      data: {
        color: createColorDto.color,  // Use the color name from DTO
      },
    });
    return { message: 'Colour successfully created!', color };
  }

  async findAll() {
    return this.prisma.color.findMany({
      where: {
        isDeleted:false
      },
    });
  }

  async findOne(id: number) {
    const color = await this.prisma.color.findUnique({
      where: {
        id,
        isDeleted:false
      },
    });
    if (!color) {
      throw new BadRequestException('Color Not Exist!');
    }
    // Check if the color is deleted
    if (color && color.isDeleted) {
      throw new BadRequestException('Color has been deleted');
    }

    return color;
  }

  async update(id: number, updateColorDto: UpdateColorDto) {
    const colour = await this.findOne(id);
    if(!colour){
      throw new BadRequestException('Colour is not exist!')
    }
    const color= this.prisma.color.update({
      where: { id },
      data: [updateColorDto],
    });
    return {message: 'Colour successfully updated!', color}
  }

  async remove(id: number) {
    const colour = await this.findOne(id);
    if(!colour || colour.isDeleted){
      throw new BadRequestException('Colour is not exist!')
    }
    const deleteColour = this.prisma.color.delete({
      where: {
        id,
        isDeleted: true
      },
    });
    return {message: 'Colour successfully deleted!',deleteColour}
  }
}
