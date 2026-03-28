import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsService } from './contracts.service';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.contractsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findAll(@CurrentUser() user: AuthUser) {
    return this.contractsService.findAll(user);
  }

  @Get(':contractId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    return this.contractsService.findOne(contractId, user);
  }
}
