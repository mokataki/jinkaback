import { Module } from '@nestjs/common';
import { ZarinpalService } from './zarinpal.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [ZarinpalService],
  exports: [ZarinpalService],
})
export class PaymentsModule {}
