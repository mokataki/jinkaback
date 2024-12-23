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


@Module({
  imports: [
    AuthModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Should be changed to a more secure secret
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}
