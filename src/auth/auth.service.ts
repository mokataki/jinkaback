// src/auth/auth.service.ts

import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
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

  // Validate user (used in JwtStrategy to validate JWT payload)
  async validateUser(email: string, userId: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.id.toString() === userId) {
      return user; // Return the user if found and userId matches
    }
    return null; // Return null if user not found or invalid userId
  }

  // Register new user (Create user and return JWT token)
  async register(createUserDto: CreateUserDto) {
    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }
    // Validate the password strength (optional, based on your requirements)
    if (createUserDto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    // Hash password and create user
    const hashedPassword = await argon2.hash(createUserDto.password);
    // Create user
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
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


}
