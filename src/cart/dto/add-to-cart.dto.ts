import {IsNotEmpty, IsNumber, IsOptional} from 'class-validator';

export class AddToCartDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsOptional()
    @IsNumber()
    userId?: number;  // Optional, for authenticated users

    @IsOptional()
    guestId?: string; // Optional, for guest users

}
