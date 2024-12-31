import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // ZarinPal API URLs
  private readonly zarinPalBaseUrl = 'https://www.zarinpal.com/pg/rest/WebGate/';

  // Fetch the ZarinPal Merchant ID from environment variables
  private readonly merchantId = process.env.ZARINPAL_MERCHANT_ID;
  // Fetch the Callback URL from environment variables
  private readonly callbackUrl = process.env.ZARINPAL_CALLBACK_URL;

  constructor() {
    if (!this.merchantId || !this.callbackUrl) {
      throw new Error('ZarinPal Merchant ID and Callback URL must be set in environment variables');
    }
  }

  /**
   * Request a payment from ZarinPal
   * @param amount - The amount to be paid
   * @param description - The description of the payment
   * @returns Payment URL for the user to complete the payment
   */
  async requestPayment(
      amount: number,
      description: string,
      userId: number | null,
      guestId: string | null
  ) {
    // Depending on userId or guestId, create a payment request
    const requestPayload = {
      merchant_id: this.merchantId,
      amount: amount,
      description: description,
      callback_url: this.callbackUrl,
    };

    // Use the appropriate ID (userId or guestId) for the payment request if needed
    // Call ZarinPal API to request the payment
    const response = await axios.post(`${this.zarinPalBaseUrl}PaymentRequest.json`, requestPayload);

    if (response.data.status === 100) {
      const authority = response.data.authority;
      const paymentUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;
      return { paymentUrl };
    } else {
      throw new BadRequestException('Failed to create payment request');
    }
  }


  /**
   * Verify the payment after the user completes the payment
   * @param verifyDto - The verification data containing authority and amount
   * @returns Payment verification result
   */
  async verifyPayment(verifyDto: VerifyPaymentDto) {
    const { authority, amount } = verifyDto;

    try {
      // Prepare the payload for payment verification
      const verifyPayload = {
        merchant_id: this.merchantId,
        authority: authority,
        amount: amount,
      };

      // Make a POST request to ZarinPal's PaymentVerification endpoint
      const response = await axios.post(`${this.zarinPalBaseUrl}PaymentVerification.json`, verifyPayload);

      // Check if the payment verification was successful
      if (response.data.status === 100) {
        // Payment was successful
        return { success: true, refId: response.data.ref_id };
      } else {
        throw new BadRequestException('Payment verification failed');
      }
    } catch (error) {
      this.logger.error('Error verifying payment from ZarinPal', error);
      throw new BadRequestException('Error verifying payment');
    }
  }
}
