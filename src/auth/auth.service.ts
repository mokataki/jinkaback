import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './strategies/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import * as DiceBear from '@dicebear/avatars';
import * as Style from '@dicebear/collection';
@Injectable()
export class AuthService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
  ) {}

  // Validate user (used in JwtStrategy to validate JWT payload)
  async validate(email: string, userId: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.id.toString() === userId) {
      return user; // Return the user if found and userId matches
    }
    return null; // Return null if user not found or invalid userId
  }


  // Generate an avatar using Dicebear
  private generateAvatar(seed: string): string {
    const avatar = DiceBear.createAvatar(Style.adventurer, {
      seed, // Seed ensures unique avatars (e.g., email or user ID)
      size: 128, // Size of the avatar in pixels
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(avatar)}`;
  }

  // Register new user (Create user and return JWT token)
  async register(createUserDto: CreateUserDto) {
    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('کاربری با این ایمیل قبلاً ثبت‌نام کرده است.');
    }

    // Validate password strength
    if (createUserDto.password.length < 8) {
      throw new BadRequestException('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }

    // Assign role: Check the total number of users in the database
    const userCount = await this.usersService.countUsers();
    const role = userCount < 2 ? 'ADMIN' : 'USER';

    // Assign a generated avatar if no photo is provided
    const avatar = createUserDto.photo || this.generateAvatar(createUserDto.email);

    // Create the user object
    const userPayload = { ...createUserDto, role, photo: avatar };

    // Create user and hash the password in the service
    const user = await this.usersService.create(userPayload);

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }

  // Login user (validate credentials and return JWT token)
  async login(loginDto: LoginUserDto) {
    // Validate the user by checking the email and password
    const user = await this.usersService.validatePassword(loginDto.email, loginDto.password);

    // If user is not found or the password is incorrect, throw an UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('اطلاعات وارد شده معتبر نیست.');
    }

    // Generate a JWT token for the valid user
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Return the token to the client
    return { access_token, user }; // Add user details if needed in the response
  }
}
