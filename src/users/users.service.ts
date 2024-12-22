// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2'; // Hashing library
import { UpdateUserDto } from './dto/update-user.dto';
import {PrismaService} from "../../prisma/prisma.service";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);
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

  // Validate password by comparing it
  async validatePassword(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (user && await argon2.verify(user.password, password)) {
      return user; // Return the user if password matches
    }
    return null; // Return null if user doesn't exist or passwords don't match
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
