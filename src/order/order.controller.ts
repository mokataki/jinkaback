import { Controller, Post, Body, Param, Request, Response, Get, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RequestWithUser } from "../common/request.interface";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard.";

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Create Order (Guest or User)
  @Post('create')
  async createOrder(@Request() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user ? req.user.userId : null;  // Get userId from JWT token
    const guestId = req.cookies['guestId'] || null;    // Get guestId from cookies, or null if logged in
    return this.orderService.createOrder(userId, guestId, createOrderDto); // Pass userId, guestId, and dto
  }

  // Get Orders (for Authenticated Users)
  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Request() req: RequestWithUser) {
    const userId = req.user ? req.user.userId : null;
    return this.orderService.getOrders(userId);
  }

  // Get Order by ID (for both Authenticated Users and Guests)
  @Get(':orderId')
  async getOrder(
      @Param('orderId') orderId: number,
      @Request() req: RequestWithUser,  // Use RequestWithUser
      @Response() res: any
  ) {
    const userId = req.user ? req.user.userId : null;
    const guestId = req.cookies['guestId'] || null;

    try {
      const order = await this.orderService.getOrderById(orderId, userId, guestId);
      return res.status(200).json({ message: 'Order fetched successfully', order });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }
}
