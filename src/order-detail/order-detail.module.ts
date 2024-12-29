// order-detail.module.ts

import { Module } from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [],
  providers: [OrderDetailService, PrismaService],
})
export class OrderDetailModule {}
