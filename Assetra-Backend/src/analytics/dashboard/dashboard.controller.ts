import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('pm')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  getPmDashboard(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getPmDashboard(user);
  }

  @Get('manager')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  getManagerDashboard(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getManagerDashboard(user);
  }

  @Get('project/:projectId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  getProjectDashboard(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return this.dashboardService.getProjectDashboard(projectId, user);
  }

  @Get('approvals')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  getApprovalQueue(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getApprovalQueue(user);
  }

  @Get('vendors/performance')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  getVendorPerformance(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getVendorPerformance(user);
  }
}
