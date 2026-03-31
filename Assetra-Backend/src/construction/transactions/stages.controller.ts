import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { TransactionsService } from './transactions.service';

@Controller('stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagesController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.transactionsService.findStagesByProject(projectId, user);
  }
}
