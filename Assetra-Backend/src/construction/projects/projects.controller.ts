import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findAll(@CurrentUser() user: AuthUser) {
    return this.projectsService.findAll(user);
  }

  @Get(':projectId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return this.projectsService.findOne(projectId, user);
  }

  @Post(':projectId/users')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  assignUser(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignProjectUserDto
  ) {
    return this.projectsService.assignUser(projectId, dto, user);
  }
}
