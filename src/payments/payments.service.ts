import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    // @ts-ignore
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest unit (e.g., cents for USD)
      currency,
    });
  }
}
