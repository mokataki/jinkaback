import { Controller, Get, Post, Param } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(':userId')
  createOrder(@Param('userId') userId: number) {
    return this.orderService.createOrder(userId);
  }

  @Get(':userId')
  getOrders(@Param('userId') userId: number) {
    return this.orderService.getOrders(userId);
  }
}
