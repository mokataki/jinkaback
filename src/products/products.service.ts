import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {AddProductDto, AdjustInventoryDto} from "../admin/dto/admin.dto";
import { Product } from '@prisma/client';


@Injectable()
export class ProductsService {
  private dto: any;
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      photos: { create: this.dto.photos.map(photo => ({ url: photo })) },
    });
  }
  async addProduct(dto: AddProductDto): Promise<Product> {
    return this.prisma.product.create({ data: dto });
  }

  async removeProduct(productId: number): Promise<Product> {
    return this.prisma.product.delete({ where: { id: productId } });
  }

  async updateProduct(productId: number, dto: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
      photos: { create: dto.photos.map(photo => ({ url: photo })) },

    });
  }


  async findAll() {
    return this.prisma.product.findMany({
      where: { id: parseInt(id, 10) },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async adjustInventory(productId: number, adjustDto: AdjustInventoryDto): Promise<Product> {
    const { amount } = adjustDto;
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id: productId } });

    const newInventory = product.inventory + amount;

    if (newInventory < 0) {
      throw new Error('Not enough inventory');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { inventory: newInventory },
    });
  }



  async delete(id: string) {
    await this.findOne(id); // Ensure product exists
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
