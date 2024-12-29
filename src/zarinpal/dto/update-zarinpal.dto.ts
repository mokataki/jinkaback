import { PartialType } from '@nestjs/mapped-types';
import { CreateZarinpalDto } from './create-zarinpal.dto';

export class UpdateZarinpalDto extends PartialType(CreateZarinpalDto) {}
