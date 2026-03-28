import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findAll(@CurrentUser() user: AuthUser) {
    return this.transactionsService.findAll(user);
  }

  @Get('project/:projectId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findByProject(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return this.transactionsService.findByProject(projectId, user);
  }

  @Post(':transactionId/approve')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  approve(
    @CurrentUser() user: AuthUser,
    @Param('transactionId', ParseIntPipe) transactionId: number
  ) {
    return this.transactionsService.approve(transactionId, user);
  }

  @Post(':transactionId/reject')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  reject(
    @CurrentUser() user: AuthUser,
    @Param('transactionId', ParseIntPipe) transactionId: number
  ) {
    return this.transactionsService.reject(transactionId, user);
  }
}
