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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthUser) {
    return this.projectsService.create(dto, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.projectsService.findAll(user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  @Get(':projectId')
  findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.projectsService.findOne(projectId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post(':projectId/users')
  assignUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignProjectUserDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.projectsService.assignUser(projectId, dto, user);
  }
}
