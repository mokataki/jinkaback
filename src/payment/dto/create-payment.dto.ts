import { IsNotEmpty, IsEmail, IsMobilePhone, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    @Min(0) // Ensures the amount is non-negative
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    callbackUrl: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEmail()
    @IsOptional() // Email can be optional if the payment does not require it
    email?: string;

    @IsMobilePhone('fa-IR', { strictMode: false }) // 'strictMode: false' allows other phone formats too
    @IsOptional() // Mobile can also be optional if not strictly required
    mobile?: string;
}
