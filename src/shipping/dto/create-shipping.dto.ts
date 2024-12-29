import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min} from "class-validator";
import {ShippingStatus} from "../../../.enum";

export class CreateShippingDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsEnum(ShippingStatus)
    @IsNotEmpty()
    status: ShippingStatus;

    @IsNumber()
    @Min(0)
    @IsPositive()
    cost: number;

    @IsString()
    @IsOptional()
    shippingMethod?: string;
}