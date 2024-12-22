import {Controller, Post, Get, Param, Body, Patch} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {UpdateOrderItemDto} from "./dto/update-order.dto";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() data: any) {
    return this.ordersService.createOrder(data);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    return this.ordersService.getOrderById(+id);
  }

  @Get('tracking/:trackingCode')
  async getOrderByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.ordersService.getOrdersByTrackingCode(trackingCode);
  }
  @Patch(':orderId/items')
  async updateOrderItem(
      @Param('orderId') orderId: string,
      @Body() updateDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(orderId, updateDto);
  }

}
