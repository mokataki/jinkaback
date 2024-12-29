import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ZarinpalModule } from '../zarinpal/zarinpal.module';

@Module({
  imports: [ZarinpalModule],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule {}
