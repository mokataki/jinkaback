import { Controller, Post, Body } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {PaymentService} from "./payment.service";

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('request')
  async requestPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const { amount, callbackUrl, description, email, mobile } = createPaymentDto;
    return this.paymentService.requestPayment(amount, callbackUrl, description, email, mobile);
  }

  @Post('verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    const { amount, authority } = verifyPaymentDto;
    return this.paymentService.verifyPayment(amount, authority);
  }
}
