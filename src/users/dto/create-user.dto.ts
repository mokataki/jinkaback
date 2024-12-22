import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6,{ message: 'Password must be at least 8 characters long.' })
    @MaxLength(20)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    photo?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(10)
    role?: string;
}
