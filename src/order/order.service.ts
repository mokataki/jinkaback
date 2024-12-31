import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private prisma: PrismaService) {}

  // src/order/order.service.ts

  async createOrder(userId: number | null, guestId: string | null, dto: CreateOrderDto) {
    const { shippingAddressId, shippingCostId } = dto;

    // Log the userId and guestId for debugging
    console.log('userId:', userId);
    console.log('guestId:', guestId);

    // Find cart based on user or guest ID
    const cart = await this.prisma.cart.findFirst({
      where: {
        AND: [
          { userId: userId ?? undefined },  // If userId is null, skip it in the query
          { guestId: guestId ?? undefined }, // If guestId is null, skip it in the query
        ],
      },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty or does not exist');
    }

    // Find shipping address
    const shippingAddress = await this.prisma.shippingAddress.findUnique({
      where: { id: shippingAddressId },
    });

    if (!shippingAddress || (userId && shippingAddress.userId !== userId)) {
      throw new NotFoundException('Shipping address not found or unauthorized');
    }

    // Fetch the shipping cost by ID
    const shippingCost = await this.prisma.shippingCost.findUnique({
      where: { id: shippingCostId },
    });

    if (!shippingCost) {
      throw new NotFoundException('Shipping cost not found');
    }

    // Calculate total price of items in the cart
    const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0,
    );

    // Add shipping cost to the total price
    const totalCost = totalPrice + shippingCost.cost;

    // Prepare order data
    const orderData: any = {
      totalPrice: totalCost,  // The total price including shipping cost
      shippingAddress: { connect: { id: shippingAddressId } },
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    };

    // Conditionally include userId or guestId
    if (userId !== null) {
      orderData.userId = userId;
    } else if (guestId !== null) {
      orderData.guestId = guestId;
    }

    try {
      // Create order in database
      const order = await this.prisma.order.create({
        data: orderData,
      });

      // Clear the cart after order is placed
      await this.prisma.cart.deleteMany({
        where: {
          OR: [{ userId }, { guestId }],
        },
      });

      return order;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw new InternalServerErrorException('Failed to create order.');
    }
  }



  async getOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });
  }

  async getOrderById(orderId: number, userId: number | null, guestId: string | null) {
    const order = userId
        ? await this.prisma.order.findFirst({
          where: { id: orderId, userId },
          include: { items: { include: { product: true } }, shippingAddress: true },
        })
        : await this.prisma.order.findFirst({
          where: { id: orderId, guestId },
          include: { items: { include: { product: true } }, shippingAddress: true },
        });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }
}
