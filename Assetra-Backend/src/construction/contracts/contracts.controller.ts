import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { RolesGuard } from '../../platform/auth/roles.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser() user: AuthUser) {
    return this.contractsService.create(dto, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.contractsService.findAll(user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.findByProject(projectId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post(':contractId/approve')
  approve(
    @Param('contractId', ParseIntPipe) contractId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.approve(contractId, user);
  }
}
