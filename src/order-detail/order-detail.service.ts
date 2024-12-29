import { Injectable } from '@nestjs/common';
import {CreateOrderDetailDto, UpdateOrderDetailDto} from './dto/order-detail.dto';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class OrderDetailService {
  constructor(private prisma: PrismaService) {}

  // Create Order Detail
  async createOrderDetail(orderId: number, createOrderDetailDto: CreateOrderDetailDto) {
    const { productId, quantity, unitPrice } = createOrderDetailDto;
    return this.prisma.orderDetail.create({
      data: {
        orderId,
        productId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice, // Calculate totalPrice
      },
    });
  }

  // Get Order Detail by ID
  async getOrderDetailById(orderDetailId: number) {
    return this.prisma.orderDetail.findUnique({
      where: { id: orderDetailId },
    });
  }

  // Update Order Detail
  async updateOrderDetail(orderDetailId: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    const { quantity, unitPrice } = updateOrderDetailDto;
    const totalPrice = quantity * unitPrice;

    return this.prisma.orderDetail.update({
      where: { id: orderDetailId },
      data: {
        quantity,
        unitPrice,
        totalPrice,
      },
    });
  }

  // Delete Order Detail
  async deleteOrderDetail(orderDetailId: number) {
    return this.prisma.orderDetail.delete({
      where: { id: orderDetailId },
    });
  }
}
