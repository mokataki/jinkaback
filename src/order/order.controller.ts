import { Controller, Post, Body, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Endpoint to create order and initiate payment
  @Post('create')
  async createOrder(
      @Body() createOrderDto: CreateOrderDto,
      @Query('userId') userId: number
  ) {
    const result = await this.orderService.createOrder(createOrderDto, userId);
    return result;
  }

  // Endpoint to verify payment after user returns from ZarinPal
  @Post('verify-payment')
  async verifyPayment(
      @Query('orderId') orderId: number,
      @Query('Authority') authority: string
  ) {
    const result = await this.orderService.verifyPayment(orderId, authority);
    return result;
  }
}
