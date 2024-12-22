import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsNotEmpty()
    newPassword: string;
}
