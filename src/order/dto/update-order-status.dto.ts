import { IsEnum } from 'class-validator';
import {OrderStatus} from "../../../.enum";

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
