// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus, Get, UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {AuthService} from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // User Registration (sign up)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // User Login (sign in)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Respond with 200 OK status code
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }


}
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import {RolesGuard} from "./guards/roles.guard";
import {JwtAuthGuard} from "./guards/jwt-auth.guard.";

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles(Role.ADMIN) // Only accessible by admins
  getDashboard() {
    return { message: 'Welcome to the Admin Panel' };
  }
}
