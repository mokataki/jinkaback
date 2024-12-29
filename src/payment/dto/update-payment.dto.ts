import { IsEnum } from 'class-validator';
import { PaymentStatus} from "../../../.enum";

export class UpdatePaymentStatusDto {
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}
