// order.module.ts

import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import {OrderDetailService} from "../order-detail/order-detail.service";
import {ShippingService} from "../shipping/shipping.service";
import {PaymentService} from "../payment/payment.service";
import {PrismaService} from "../../prisma/prisma.service";
import {ZarinpalModule} from "../zarinpal/zarinpal.module";


@Module({
  imports: [ZarinpalModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderDetailService,
    ShippingService,
    PaymentService,
    PrismaService, // Ensure PrismaService is available to the services
  ],
})
export class OrderModule {}
