import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  projectId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  vendorId!: number;
}
