// src/auth/auth.service.ts

import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {JwtPayload} from "./strategies/jwt-payload.interface";
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
      private prisma: PrismaService,
      private usersService: UsersService,
      private jwtService: JwtService,
  ) {}

  // Validate user (used in JwtStrategy to validate JWT payload)
  async validate(email: string, userId: string) {
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

    // Validate password strength
    if (createUserDto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    // Create user and hash the password in the service
    const user = await this.usersService.create(createUserDto);  // Hashing happens in the service

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }


  // Login user (validate credentials and return JWT token)
  async login(loginDto: LoginUserDto) {
    // Validate the user by checking the email and password

    // @ts-ignore
    const user = await this.usersService.validatePassword(
        loginDto.email,
        loginDto.password
        );
    // If user is not found or the password is incorrect, throw an UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate a JWT token for the valid user
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Return the token to the client
    return { access_token };  // Add user details if needed in the response
  }

}
