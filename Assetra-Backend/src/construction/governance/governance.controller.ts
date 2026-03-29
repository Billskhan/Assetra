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
import { GovernanceService } from './governance.service';
import { UpsertProjectGovernanceDto } from './dto/upsert-project-governance.dto';
import { RolesGuard } from '../../platform/auth/roles.guard';

@Controller('governance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.governanceService.findByProject(projectId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post('project/:projectId')
  upsertByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpsertProjectGovernanceDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.governanceService.upsertByProject(projectId, dto, user);
  }
}
