// shipping.module.ts

import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [],
  providers: [ShippingService, PrismaService],
})
export class ShippingModule {}
