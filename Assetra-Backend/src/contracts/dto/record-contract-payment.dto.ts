import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export enum ContractPaymentModeDto {
  CASH = 'CASH',
  BANK = 'BANK',
  ONLINE = 'ONLINE',
  CHEQUE = 'CHEQUE'
}

export class RecordContractPaymentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contractId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  milestoneId?: number;

  @IsDateString()
  paymentDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsEnum(ContractPaymentModeDto)
  paymentMode?: ContractPaymentModeDto;

  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
