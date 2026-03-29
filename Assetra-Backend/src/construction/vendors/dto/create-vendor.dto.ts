import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsBoolean()
  isGlobal!: boolean;
}
