import { Injectable } from '@nestjs/common';
import { ZarinpalService } from '../zarinpal/zarinpal.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '../../.enum';

@Injectable()
export class OrderService {
  constructor(
      private prisma: PrismaService,
      private readonly zarinpalService: ZarinpalService, // Inject ZarinpalService
  ) {}

  // Create an order and initiate payment
  async createOrder(createOrderDto: CreateOrderDto, userId?: number) {
    const { orderDetails, shipping, payment, guestInfo } = createOrderDto;

    // Calculate total amount
    const totalAmount = orderDetails.reduce(
        (sum, detail) => sum + detail.unitPrice * detail.quantity,
        0,
    );

    // Prepare order data
    const orderData: any = {
      orderNumber: `order${Date.now()}`,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount,
      shipping: {
        create: shipping,
      },
      payment: {
        create: {
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
        },
      },
      orderDetails: {
        create: orderDetails,
      },
    };

    // Add user or guest info
    if (userId) {
      orderData.user = {
        connect: { id: userId },
      };
    } else {
      orderData.guestInfo = {
        create: {
          name: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone,
          address: guestInfo.address,
        },
      };
    }

    // Create the order
    const order = await this.prisma.order.create({
      data: orderData,
    });

    // Generate payment link
    const callbackUrl = `http://localhost:3000/order/verify-payment?orderId=${order.id}`;
    const paymentUrl = await this.zarinpalService.createPaymentRequest(
        totalAmount.toString(),
        callbackUrl,
        'Order Payment',
        guestInfo?.email || '', // Fallback to empty string if email is not provided
        guestInfo?.phone || '', // Fallback to empty string if phone is not provided
    );

    return { orderId: order.id, paymentUrl };
  }

  // Verify payment after callback
  async verifyPayment(orderId: number, authority: string) {
    // Fetch the order along with its details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderDetails: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate the total amount from order details
    const totalAmount = order.orderDetails.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
    );

    // Verify payment with ZarinPal
    const paymentStatus = await this.zarinpalService.verifyPayment(
        totalAmount.toString(),
        authority,
    );

    if (paymentStatus.includes('Ref ID')) {
      // Payment successful, update order status to 'Paid'
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      return { message: 'Payment successful', refId: paymentStatus };
    } else {
      // Payment failed
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return { message: 'Payment failed' };
    }
  }
}
