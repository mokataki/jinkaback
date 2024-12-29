// src/app.module.ts

import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {PrismaService} from "../prisma/prisma.service";
import {JwtStrategy} from "./auth/strategies/jwt.strategy";
import {JwtAuthGuard} from "./auth/guards/jwt-auth.guard.";
import {RolesGuard} from "./auth/guards/roles.guard";
import {AuthModule} from "./auth/auth.module";
import {UsersModule} from "./users/users.module";
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ColorsModule } from './colors/colors.module';
import { PhotosModule } from './photos/photos.module';
import { TagsModule } from './tags/tags.module';
import { ArticlesModule } from './articles/articles.module';
import { ArticleCategorisModule } from './article-categoris/article-categoris.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentModule } from './payment/payment.module';
import { ZarinpalService } from './zarinpal/zarinpal.service';
import { ZarinpalModule } from './zarinpal/zarinpal.module';


@Module({
  imports: [
    AuthModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Should be changed to a more secure secret
      signOptions: { expiresIn: '1h' },
    }),
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    ColorsModule,
    PhotosModule,
    TagsModule,
    ArticlesModule,
    ArticleCategorisModule,
    OrderModule,
    OrderDetailModule,
    ShippingModule,
    PaymentModule,
    ZarinpalModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    ZarinpalService,
  ],
})
export class AppModule {}
