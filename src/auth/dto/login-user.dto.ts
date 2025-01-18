import {IsEmail, IsNotEmpty, IsString, MaxLength, MinLength} from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, { message: 'ایمیل باید یک آدرس ایمیل معتبر باشد.' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'کلمه عبور باید حداقل ۸ کاراکتر باشد.' })
    @MaxLength(20)
    password: string;
}
