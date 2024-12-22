// src/users/users.controller.ts

import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard.";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../roles/roles.decorator";
import {Role} from "../roles/role.enum";
import {ChangePasswordDto} from "./dto/change-password.dto";


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.usersService.validatePassword(loginDto.email, loginDto.password);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)  // This route is restricted to users with 'USER' or 'ADMIN' role
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('change-password/:id')
  @UseGuards(JwtAuthGuard)
  async changePassword(
      @Param('id') id: number,
      @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { newPassword } = changePasswordDto; // Extract the new password from the DTO
    return this.usersService.changePassword(id, newPassword); // Pass the password as a string
  }
}
