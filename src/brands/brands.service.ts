import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      const existingBrand = await this.findOneByName(createBrandDto.brandName);
      if (existingBrand) {
        throw new BadRequestException(`Brand with name '${createBrandDto.brandName}' already exists!`);
      }

      const brand = await this.prisma.brand.create({
        data: createBrandDto,
      });

      return {
        message: 'Brand successfully created!',
        brand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByName(brandName: string) {
    try {
      return await this.prisma.brand.findUnique({
        where: { brandName },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    try {
      return await this.prisma.brand.findMany();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${id} does not exist!`);
      }

      return brand;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    try {
      const brandExisting = await this.findOne(id);
      if (!brandExisting) {
        throw new NotFoundException(`Brand with ID ${id} does not exist!`);
      }

      const updatedBrand = await this.prisma.brand.update({
        where: { id },
        data: updateBrandDto,
      });

      return {
        message: 'Brand successfully updated!',
        brand: updatedBrand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const brandExisting = await this.findOne(id);
      if (!brandExisting) {
        throw new NotFoundException(`Brand with ID ${id} does not exist!`);
      }

      const brand = await this.prisma.brand.delete({
        where: { id },
      });

      return {
        message: 'Brand successfully deleted!',
        brand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // General error handler to manage different types of errors
  private handleError(error: any) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;  // Rethrow known exceptions
    }

    if (error.code === 'P2002') { // Prisma unique constraint error code
      throw new BadRequestException('A brand with this name already exists!');
    }

    // For unknown errors, log and throw a generic error
    console.error(error);
    throw new Error('An unexpected error occurred.');
  }
}
