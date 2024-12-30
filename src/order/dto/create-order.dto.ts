import {
    IsInt,
    IsString,
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber
} from 'class-validator';
import {CreatePaymentDto} from "../../payment/dto/create-payment.dto";
import {CreateShippingDto} from "../../shipping/dto/create-shipping.dto";
export class CreateGuestInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;
}
export class CreateOrderDto {
    @IsInt()
    @IsNotEmpty()
    userId?: number;

    @IsNotEmpty()
    guestInfo: CreateGuestInfoDto;


    guestInfoId?: number;  // Optional guest info

    @IsNotEmpty()
    shipping: CreateShippingDto;

    @IsNotEmpty()
    payment: CreatePaymentDto;

    orderDetails: {
        productId: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];  // Array of order details
}

