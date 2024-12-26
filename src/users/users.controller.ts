import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Get,
  Req,
  Patch,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { photoUploadConfig } from '../utils/file-upload.util';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard.";

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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('change-password/:id')
  @UseGuards(JwtAuthGuard)
  async changePassword(
      @Param('id', ParseIntPipe) id: number,
      @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto.newPassword);
  }

  @Patch(':id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', photoUploadConfig))
  async uploadPhoto(
      @Param('id', ParseIntPipe) id: number,
      @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.handlePhotoUpload(id, file);
  }
}
