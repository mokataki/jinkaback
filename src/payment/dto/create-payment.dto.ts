import {IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min} from "class-validator";
import {PaymentMethod} from "../../../.enum";

export class CreatePaymentDto {
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsInt()
    amount: number;

    @IsString()
    transactionId: string;

    @IsNotEmpty()
    guestInfo: {
        email: string;
        phone: string;
    };
}
