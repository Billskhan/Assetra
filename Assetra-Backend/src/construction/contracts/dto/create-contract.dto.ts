import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @Type(() => Number)
  @IsNumber()
  projectId!: number;

  @Type(() => Number)
  @IsNumber()
  vendorId!: number;
}
