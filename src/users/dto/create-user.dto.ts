import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'ایمیل باید یک آدرس ایمیل معتبر باشد.' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'کلمه عبور باید حداقل ۸ کاراکتر باشد.' })
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
