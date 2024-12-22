import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {AddProductDto, AdjustInventoryDto} from "./dto/admin.dto";
import {UpdateProductDto} from "../products/dto/update-product.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id : orderId.toString() },
      data: { status },
    });
  }

  async addShippingMethod(data: { name: string; price: number; deliveryTime: string }) {
    return this.prisma.shippingMethod.create({
      data,
    });
  }
  async addProduct(addProductDto: AddProductDto) {
    const { name, description, price, inventory, photos } = addProductDto;

    return this.prisma.product.create({
      data: {
        name,
        description,
        price,
        inventory,
        photos: { connect: photos.map(photo => ({ url: photo })),
      },
    });
  }

  async adjustInventory(productId: string, adjustDto: AdjustInventoryDto, increase = true) {
    const { quantity } = adjustDto;

    const product = await this.findUnique(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newInventory = increase
        ? product.inventory + quantity
        : product.inventory - quantity;

    if (newInventory < 0) {
      throw new BadRequestException('Inventory cannot be negative');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { inventory: newInventory },
    });
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }


    return this.prisma.product.update({
      where: { id: productId },
      data: { ...updateProductDto },
    });
  }

  async removeProduct(productId: string) {
    const product = await this.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { isDeleted: true },
    });
  }

  async getShippingMethods() {
    return this.prisma.shippingMethod.findMany();
  }
}
