import { Controller, Post, Body, Query } from '@nestjs/common';
import { ZarinpalService } from './zarinpal.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly zarinpalService: ZarinpalService) {}

  @Post('request')
  async requestPayment(
      @Body('amount') amount: number,
      @Body('callbackUrl') callbackUrl: string,
      @Body('description') description: string,
      @Body('email') email?: string,
      @Body('mobile') mobile?: string,
  ) {
    return await this.zarinpalService.requestPayment(amount, callbackUrl, description, email, mobile);
  }

  @Post('verify')
  async verifyPayment(
      @Body('amount') amount: number,
      @Body('authority') authority: string,
  ) {
    return await this.zarinpalService.verifyPayment(amount, authority);
  }
}
