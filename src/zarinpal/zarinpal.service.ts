import * as ZarinpalCheckout from 'zarinpal-checkout';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZarinpalService {
  private zarinpal: any;

  constructor() {
    // Initialize Zarinpal with your Merchant ID
    this.zarinpal = ZarinpalCheckout.create('your-merchant-id', false); // Replace with actual Merchant ID
  }

  // Create a payment request with Zarinpal
  async createPaymentRequest(
      amount: string,
      callbackUrl: string,
      description: string,
      email: string,
      mobile: string
  ) {
    try {
      const response = await this.zarinpal.PaymentRequest({
        Amount: amount,
        CallbackURL: callbackUrl,
        Description: description,
        Email: email,
        Mobile: mobile,
      });

      if (response.status === 100) {
        return response.url; // Return the payment URL to be used in the frontend
      } else {
        throw new Error('Failed to create payment request');
      }
    } catch (error) {
      throw new Error(`Zarinpal error: ${error.message}`);
    }
  }

  // Verify the payment after the callback from Zarinpal
  async verifyPayment(amount: string, authority: string) {
    try {
      const response = await this.zarinpal.PaymentVerification({
        Amount: amount,
        Authority: authority,
      });

      if (response.status === 100) {
        return `Ref ID: ${response.RefID}`; // Return Ref ID if successful
      } else {
        return `Payment verification failed with status: ${response.status}`;
      }
    } catch (error) {
      throw new Error(`Zarinpal verification error: ${error.message}`);
    }
  }
}
