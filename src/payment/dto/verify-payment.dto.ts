import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyPaymentDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    authority: string;
}
