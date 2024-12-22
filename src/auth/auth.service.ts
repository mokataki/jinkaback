// src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as argon2 from 'argon2';
import {JwtPayload} from "./strategies/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
  ) {}

  // Register new user (Create user and return JWT token)
  async register(createUserDto: CreateUserDto) {
    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    // Hash password and create user
    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  // Login user (validate credentials and return JWT token)
  async login(loginDto: LoginUserDto) {
    const user = await this.usersService.validatePassword(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  // Validate user (used in JwtStrategy to validate JWT payload)
  async validateUser(email: string, userId: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.id.toString() === userId) {
      return user; // Return the user if found and userId matches
    }
    return null; // Return null if user not found or invalid userId
  }
}
