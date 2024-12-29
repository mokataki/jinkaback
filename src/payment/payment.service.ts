import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ZarinpalService } from '../zarinpal/zarinpal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
      private prisma: PrismaService,
      private zarinpalService: ZarinpalService
  ) {}

  // Create a payment and initiate payment request with Zarinpal
  async createPayment(orderId: number, createPaymentDto: CreatePaymentDto) {
    const { amount, guestInfo } = createPaymentDto;

    // Use Zarinpal to create payment request
    const callbackUrl = `http://localhost:3000/payment/verify?orderId=${orderId}`;
    const paymentUrl = await this.zarinpalService.createPaymentRequest(
        amount.toString(),
        callbackUrl,
        'Payment for Order',
        guestInfo.email,
        guestInfo.phone
    );

    // Create a payment record in the database
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        paymentMethod: createPaymentDto.paymentMethod,
        amount,
        paymentStatus: 'PENDING', // Initial status
        transactionId: createPaymentDto.transactionId,
      },
    });

    return { paymentUrl, payment };
  }

  // Update payment status (after verification from Zarinpal)
  async updatePaymentStatus(paymentId: number, updatePaymentStatusDto: UpdatePaymentStatusDto) {
    const { status } = updatePaymentStatusDto;

    // Update the payment status in the database
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: status },
    });

    return updatedPayment;
  }
}
