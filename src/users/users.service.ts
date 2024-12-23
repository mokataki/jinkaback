// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2'; // Hashing library
import { UpdateUserDto } from './dto/update-user.dto';
import {PrismaService} from "../../prisma/prisma.service";
import {ChangePasswordDto} from "./dto/change-password.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // Hash password
      },
    });
  }

  // Find a user by email
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  // Get user profile by ID
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  // Validate the password by comparing the hashed password
  async validatePassword(email: string, password: string) {
    // Find user by email
    console.log('Checking email:', email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    console.log('Found user:', user);

    // If user does not exist, return null
    if (!user) {
      return null;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(user.password, password);
    console.log('Password valid:', password);
    console.log('Password valid:', user.password);


    if (isPasswordValid) {
      return null;
    }

    // If the password matches, return the user (excluding sensitive data like password)
    return {
      email: user.email,
      id: user.id,
      role: user.role,
    };
  }

  // Update user data
  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Change user's password
  async changePassword(id: number, newPassword: string) {
    // Ensure that 'newPassword' is a string, then hash it
    const hashedPassword = await argon2.hash(newPassword);
    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
