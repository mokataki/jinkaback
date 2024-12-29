import { Controller, Post, Param, Body, Put } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import {CreateShippingDto} from "./dto/create-shipping.dto";
import {UpdateShippingStatusDto} from "./dto/update-shipping.dto";

@Controller('orders/:orderId/shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // Create Shipping
  @Post()
  async createShipping(
      @Param('orderId') orderId: number,
      @Body() createShippingDto: CreateShippingDto,
  ) {
    return this.shippingService.createShipping(orderId, createShippingDto);
  }

  // Update Shipping Status
  @Put(':shippingId/status')
  async updateShippingStatus(
      @Param('shippingId') shippingId: number,
      @Body() updateShippingStatusDto: UpdateShippingStatusDto,
  ) {
    return this.shippingService.updateShippingStatus(shippingId, updateShippingStatusDto);
  }
}
