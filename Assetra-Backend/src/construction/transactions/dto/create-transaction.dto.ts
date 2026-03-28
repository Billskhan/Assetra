import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionItemDto } from './transaction-item.dto';

export class CreateTransactionDto {
  @IsString()
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  projectId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  contractId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items!: TransactionItemDto[];
}
