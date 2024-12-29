import { Controller, Post, Body, Query } from '@nestjs/common';
import { ZarinpalService } from './zarinpal.service';

@Controller('zarinpal')
export class ZarinpalController {
  constructor(private readonly zarinpalService: ZarinpalService) {}

  // Endpoint to create a payment request
  @Post('pay')
  async createPayment(
      @Body('amount') amount: string,
      @Body('callbackUrl') callbackUrl: string,
      @Body('description') description: string,
      @Body('email') email: string,
      @Body('mobile') mobile: string
  ) {
    const paymentUrl = await this.zarinpalService.createPaymentRequest(
        amount,
        callbackUrl,
        description,
        email,
        mobile
    );
    return { paymentUrl };
  }

  // Endpoint to verify the payment after the user returns from ZarinPal
  @Post('verify')
  async verifyPayment(
      @Query('Authority') authority: string,
      @Query('Status') status: string,
      @Body('amount') amount: string
  ) {
    if (status === 'OK') {
      const result = await this.zarinpalService.verifyPayment(amount, authority);
      return { message: result };
    } else {
      return { message: 'Payment failed or cancelled by user' };
    }
  }
}
