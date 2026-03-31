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
import { EntryType, PaymentMode } from '@prisma/client';

export class CreateTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;

  @IsOptional()
  @IsString()
  stageName?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  vendorId!: number;

  @IsDateString()
  date!: string;

  @IsEnum(EntryType)
  entryType!: EntryType;

  @IsString()
  category!: string;

  @IsString()
  subCategory!: string;

  @IsString()
  item!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carriage?: number;

  @IsOptional()
  @IsString()
  length?: string;

  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
