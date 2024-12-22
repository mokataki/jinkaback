import { Injectable } from '@nestjs/common';
import ZarinpalCheckout from 'zarinpal-checkout';

@Injectable()
export class ZarinpalService {
    private zarinpal;

    constructor() {
        // Initialize ZarinPal instance with MerchantID
        this.zarinpal = ZarinpalCheckout.create(
            process.env.ZARINPAL_MERCHANT_ID,
            process.env.ZARINPAL_SANDBOX === 'true', // Sandbox mode toggle
            'IRT', // Currency (IRR for Rials, IRT for Tomans)
        );
    }

    async requestPayment(amount: number, callbackUrl: string, description: string, email?: string, mobile?: string) {
        try {
            const response = await this.zarinpal.PaymentRequest({
                Amount: amount.toString(), // Amount in Tomans
                CallbackURL: callbackUrl,
                Description: description,
                Email: email || '',
                Mobile: mobile || '',
            });

            if (response.status === 100) {
                return {
                    success: true,
                    url: response.url,
                    authority: response.authority,
                };
            } else {
                throw new Error(`Payment Request failed with status: ${response.status}`);
            }
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async verifyPayment(amount: number, authority: string) {
        try {
            const response = await this.zarinpal.PaymentVerification({
                Amount: amount.toString(),
                Authority: authority,
            });

            if (response.status === 100) {
                return {
                    success: true,
                    refId: response.RefID,
                };
            } else {
                return { success: false, message: 'Payment not verified' };
            }
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getUnverifiedTransactions() {
        try {
            const response = await this.zarinpal.UnverifiedTransactions();
            if (response.status === 100) {
                return {
                    success: true,
                    authorities: response.authorities,
                };
            }
            return { success: false, message: 'No unverified transactions' };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }
}
