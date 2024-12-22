import { IsEmail, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @IsString()
    @IsOptional()
    photo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    role?: string;
}
