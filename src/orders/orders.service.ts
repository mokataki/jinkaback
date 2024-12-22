import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ZarinpalService } from '../payments/zarinpal.service';
import { ProductsService } from '../products/products.service';
import {PrismaService} from "../../prisma/prisma.service";
import {CreateOrderDto} from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(
      private prisma: PrismaService,
      private zarinpalService: ZarinpalService,
      private productsService: ProductsService,
  ) {}

  async initiateOrder(orderDto: CreateOrderDto) {
    const { items } = orderDto;

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product || product.inventory === 0) {
        throw new BadRequestException(
            `Product "${product?.name || 'Non-existent product'}" is out of stock.`
        );
      }

      if (product.inventory < item.quantity) {
        throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.inventory}, Requested: ${item.quantity}`
        );
      }
    }


    // Proceed to create the order and initiate payment
    const order = await this.createOrder(orderDto);
    return this.initiatePayment(order);
  }
  async createOrder(orderDto: CreateOrderDto) {
    const { items, customerId, shippingAddress, paymentMethod } = orderDto;

    let totalCost = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product || product.inventory === 0) {
        throw new BadRequestException(
            `Product "${product?.name || 'Non-existent product'}" is out of stock.`
        );
      }

      if (product.inventory < item.quantity) {
        throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.inventory}, Requested: ${item.quantity}`
        );
      }

      // Calculate the cost for this product
      const itemCost = product.price * item.quantity;
      totalCost += itemCost;

      // Add price to the processed items
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Add the product price here
      });
    }

    // Save the order
    const order = await this.prisma.order.create({
      data: {
        customerId,
        shippingAddress,
        paymentMethod,
        totalCost, // Store total cost in the database
        items: { create: processedItems }, // Store items in the database
      },
    });

    return order;
  }
  async verifyPayment(orderId: string, authority: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }, // Include related order items
    });

    if (!order) throw new NotFoundException('Order not found');

    const verification = await this.zarinpalService.verifyPayment(order.totalAmount, authority);
    if (verification.success) {
      // Update order status to "Paid" in DB
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'Paid', paymentRefId: verification.refId },
      });

      // Adjust inventory for each item
      for (const item of order.items) {
        await this.productsService.adjustInventory({ productId: item.productId, quantity: -item.quantity });
      }

      return { success: true, refId: verification.refId };
    }

    throw new Error('Payment verification failed');
  }
  async updateOrderItem(orderId: string, updateDto: UpdateOrderItemDto) {
    const { productId, newQuantity } = updateDto;

    // Find the order and item
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const item = order.items.find((i) => i.productId === productId);

    if (!item) {
      throw new NotFoundException('Product not found in order');
    }

    // Handle removal or quantity update
    if (newQuantity === undefined || newQuantity <= 0) {
      // Remove product from order
      await this.prisma.orderItem.delete({ where: { id: item.id } });

      // Restore the full quantity to inventory
      await this.productsService.adjustInventory(productId, item.quantity);
    } else {
      // Decrease quantity
      const quantityChange = item.quantity - newQuantity;

      if (quantityChange < 0) {
        throw new BadRequestException('Cannot increase quantity this way');
      }

      // Update the order item
      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: { quantity: newQuantity },
      });

      // Restore the difference to inventory
      await this.productsService.adjustInventory(productId, quantityChange);
    }

    return { message: 'Order updated successfully' };
  }

}
