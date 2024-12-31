import { Controller, Post, Body, Query, Request, Logger, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RequestWithUser } from "../common/request.interface"; // Custom request interface to handle user info

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Request a payment from ZarinPal (for both registered users and guests)
   * @param amount - The payment amount
   * @param description - Description of the payment
   * @param guestId - Optional guestId for guest users
   * @returns Payment URL for the user to complete the payment
   */
  @Post('request')
  async requestPayment(
      @Body('amount') amount: number,
      @Body('description') description: string,
      @Request() req: RequestWithUser, // Request object contains user/guest info
  ) {
    try {
      if (!amount || !description) {
        throw new BadRequestException('Amount and description are required');
      }

      // Check if the user is logged in (userId exists)
      const userId = req.user ? req.user.userId : null;
      const guestId = req.cookies['guestId'] || null; // Or retrieve guestId from the request if available

      // If no userId or guestId is found, we throw an error
      if (!userId && !guestId) {
        throw new BadRequestException('User or guest ID is required for payment');
      }

      // Call the payment service to request payment (pass either userId or guestId)
      const response = await this.paymentService.requestPayment(amount, description, userId, guestId);

      if (!response.paymentUrl) {
        throw new BadRequestException('Failed to get the payment URL');
      }

      return { message: 'Payment request successful', paymentUrl: response.paymentUrl };
    } catch (error) {
      this.logger.error('Error requesting payment:', error);
      throw new BadRequestException('Error requesting payment');
    }
  }

  /**
   * Verify the payment after user/guest completes the payment
   * @param verifyDto - The verify payment DTO containing authority and amount
   * @returns Payment verification result
   */
  @Post('verify')
  async verifyPayment(@Body() verifyDto: VerifyPaymentDto) {
    try {
      if (!verifyDto.authority || !verifyDto.amount) {
        throw new BadRequestException('Authority and amount are required');
      }

      const result = await this.paymentService.verifyPayment(verifyDto);

      return {
        message: 'Payment verification successful',
        refId: result.refId,
        status: result.success ? 'Success' : 'Failed',
      };
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      throw new BadRequestException('Error verifying payment');
    }
  }
}
