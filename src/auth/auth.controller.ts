import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer.config';
import { AuthService } from './auth.service';
import { Express } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async register(
      @Body() data: any,
      @UploadedFile() photo: Express.Multer.File,
  ) {
    const user = {
      ...data,
      photo: `/uploads/${photo.filename}`,
    };
    return this.authService.register(user);
  }
}
