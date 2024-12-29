import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Handle creating a payment
  @Post('create/:orderId')
  async createPayment(@Param('orderId') orderId: number, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(orderId, createPaymentDto);
  }

  // Handle updating the payment status
  @Post('update-status/:paymentId')
  async updatePaymentStatus(@Param('paymentId') paymentId: number, @Body() updatePaymentStatusDto: UpdatePaymentStatusDto) {
    return this.paymentService.updatePaymentStatus(paymentId, updatePaymentStatusDto);
  }
}
