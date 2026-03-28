import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVendorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isGlobal?: boolean;
}
