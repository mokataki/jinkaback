import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../../prisma/prisma.service';
import {PaymentService} from "./payment.service";

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],  // Export PaymentService so other modules can use it

})
export class PaymentModule {}
