import { Controller, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { CreateOrderDetailDto, UpdateOrderDetailDto } from './dto/order-detail.dto';

@Controller('orders/:orderId/order-details')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  // Create Order Detail
  @Post()
  async createOrderDetail(
      @Param('orderId') orderId: number,
      @Body() createOrderDetailDto: CreateOrderDetailDto,
  ) {
    return this.orderDetailService.createOrderDetail(orderId, createOrderDetailDto);
  }

  // Update Order Detail
  @Put(':id')
  async updateOrderDetail(
      @Param('id') orderDetailId: number,
      @Body() updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.orderDetailService.updateOrderDetail(orderDetailId, updateOrderDetailDto);
  }

  // Delete Order Detail
  @Delete(':id')
  async deleteOrderDetail(@Param('id') orderDetailId: number) {
    return this.orderDetailService.deleteOrderDetail(orderDetailId);
  }
}
