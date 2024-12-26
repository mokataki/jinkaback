// src/brands/brands.service.ts
import {BadRequestException, Injectable} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.findOneByName(createBrandDto.brandName);
    if (existingBrand) {
      throw new BadRequestException('Brand already exists!');
    }
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }
  async findOneByName(brandName: string) {
    return this.prisma.brand.findUnique({
      where: { brandName },  // Find by color name
    });
  }
  async findAll() {
    return this.prisma.brand.findMany();
  }

  async findOne(id: number) {
    const brand= this.prisma.brand.findUnique({
      where: { id },
    });
    if (!brand) {
      throw new BadRequestException('Brand is not exist!');
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brandExisting = await this.findOne(id);
    if(!brandExisting){
      throw new BadRequestException('Brand is not exist!')

    }
    const brand= this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
    return {message: 'Brand successfully updated!', brand}

  }

  async remove(id: number) {
    const brandExisting = await this.findOne(id);
    if(!brandExisting){
      throw new BadRequestException('Brand is not exist!')
    }
    const brand= this.prisma.brand.delete({
      where: { id },
    });
    return {message: 'Brand successfully deleted!', brand}

  }
}
