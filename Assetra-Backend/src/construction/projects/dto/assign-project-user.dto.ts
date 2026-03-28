import { IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectRole } from '@prisma/client';

export class AssignProjectUserDto {
  @Type(() => Number)
  @IsNumber()
  userId!: number;

  @IsEnum(ProjectRole)
  projectRole!: ProjectRole;
}
