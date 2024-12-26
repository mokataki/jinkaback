import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // Hashed password is stored here
      },
    });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return only necessary data (e.g., excluding sensitive info like password)
    return { id: user.id, email: user.email, role: user.role, photo: user.photo };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async validatePassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    console.log(`Input Password: '${password}'`);
    console.log(`Stored Hash: '${user.password}'`);
    console.log(`Hash Length: ${user.password.length}`);

    const isPasswordValid = await argon.verify(user.password, password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      throw new BadRequestException('Wrong Password!');
    }
    return {
      email: user.email,
      id: user.id,
      role: user.role,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async changePassword(id: number, newPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async handlePhotoUpload(userId: number, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      console.log('Uploaded file:', file); // Debug log for troubleshooting
      const photoPath = await this.savePhotoToDisk(file);
      console.log('Photo saved at:', photoPath);
      return this.updatePhotoInDatabase(userId, photoPath);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Photo upload failed');
    }
  }

  private async savePhotoToDisk(file: Express.Multer.File): Promise<string> {
    // Since diskStorage writes directly, we use the file's path
    const filePath = file.path; // Path where the file was saved
    return filePath.replace(/\\/g, '/'); // Normalize Windows paths
  }

  private async updatePhotoInDatabase(userId: number, photoPath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { photo: photoPath },
    });
  }
}
