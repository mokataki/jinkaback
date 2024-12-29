import {
    IsInt,
    IsString,
    IsEmail,
    IsNotEmpty,
    IsArray,
    IsPhoneNumber
} from 'class-validator';
import {CreatePaymentDto} from "../../payment/dto/create-payment.dto";
import {CreateShippingDto} from "../../shipping/dto/create-shipping.dto";
import {CreateOrderDetailDto} from "../../order-detail/dto/order-detail.dto";

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

    @IsArray()
    @IsNotEmpty()
    orderDetails: CreateOrderDetailDto[];

    @IsNotEmpty()
    shipping: CreateShippingDto;

    @IsNotEmpty()
    payment: CreatePaymentDto;
}

