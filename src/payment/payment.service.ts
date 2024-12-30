import { Injectable } from '@nestjs/common';
import * as ZarinpalCheckout from 'zarinpal-checkout';

import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private zarinpal:any;

  constructor() {
    try {
      // Make sure you are using the correct Merchant ID and Sandbox flag
      this.zarinpal = ZarinpalCheckout.create('your-merchant-id', false); // Replace with actual Merchant ID

      console.log('ZarinPal API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ZarinPal API', error);
      throw new InternalServerErrorException('Failed to initialize ZarinPal API');
    }
  }

  async requestPayment(amount: number, callbackUrl: string, description: string, email: string, mobile: string) {
    try {
      const response = await this.zarinpal.PaymentRequest({
        Amount: amount.toString(), // مبلغ به تومان
        CallbackURL: callbackUrl,
        Description: description,
        Email: email,
        Mobile: mobile,
      });

      if (response.status === 100) {
        return response.url; // لینک پرداخت
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment Request Failed:', error);
      throw new InternalServerErrorException('Payment request failed');
    }
  }

  async verifyPayment(amount: number, authority: string) {
    try {
      const response = await this.zarinpal.PaymentVerification({
        Amount: amount.toString(),
        Authority: authority,
      });

      if (response.status === 100) {
        return { refId: response.RefID, status: response.status };
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment Verification Failed:', error);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }
}
