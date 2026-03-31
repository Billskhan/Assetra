import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../platform/auth/jwt-auth.guard';
import type { AuthUser } from '../platform/auth/interfaces/auth-user.interface';
import { Roles } from '../platform/auth/roles.decorator';
import { RolesGuard } from '../platform/auth/roles.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { RecordContractPaymentDto } from './dto/record-contract-payment.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser() user: AuthUser) {
    return this.contractsService.create(dto, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.contractsService.findAll(user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.findByProject(projectId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Post('payments')
  recordPayment(
    @Body() dto: RecordContractPaymentDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.recordPayment(dto, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get(':id/payments')
  getPayments(
    @Param('id', ParseIntPipe) contractId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.getPaymentHistory(contractId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) contractId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.findOne(contractId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) contractId: number,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.contractsService.update(contractId, dto, user);
  }
}
