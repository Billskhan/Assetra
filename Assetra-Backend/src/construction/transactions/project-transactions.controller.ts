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
import { RolesGuard } from '../../platform/auth/roles.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('projects/:projectId/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectTransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Post()
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.transactionsService.create(dto, user, projectId);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get()
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.transactionsService.findByProject(projectId, user);
  }
}
