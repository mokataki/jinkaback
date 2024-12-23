// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module'; // Import the Users module to interact with user data
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import {JwtStrategy} from "./strategies/jwt.strategy";
import {PrismaModule} from "../../prisma/prisma.module";

@Module({
  imports: [
    UsersModule, // Import UsersModule to interact with UsersService
    PassportModule, // Import PassportModule to handle authentication
    PrismaModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Use a secret for signing JWT tokens
      signOptions: { expiresIn: '1h' }, // Set token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Add AuthService and JwtStrategy
  exports: [AuthService], // Export AuthService if you need to use it elsewhere
})
export class AuthModule {}
