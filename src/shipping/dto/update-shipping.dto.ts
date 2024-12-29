import {IsEnum, IsNotEmpty} from "class-validator";
import {ShippingStatus} from "../../../.enum";

export class UpdateShippingStatusDto {
    @IsEnum(ShippingStatus)
    @IsNotEmpty()
    status: ShippingStatus;
}

