import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionItemDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitPrice!: number;
}
