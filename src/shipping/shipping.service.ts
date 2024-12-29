import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {CreateShippingDto} from "./dto/create-shipping.dto";
import {UpdateShippingStatusDto} from "./dto/update-shipping.dto";

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async createShipping(orderId: number, createShippingDto: CreateShippingDto) {
    return this.prisma.shipping.create({
      data: {
        orderId,
        ...createShippingDto,
      },
    });
  }

  async updateShippingStatus(orderId: number, updateShippingStatusDto: UpdateShippingStatusDto) {
    return this.prisma.shipping.update({
      where: { orderId },
      data: {
        status: updateShippingStatusDto.status,
      },
    });
  }
}
