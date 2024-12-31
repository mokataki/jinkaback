import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../../prisma/prisma.service';
import {PaymentModule} from "../payment/payment.module";

@Module({
  imports: [PaymentModule],  // Import the PaymentModule containing PaymentService
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}
