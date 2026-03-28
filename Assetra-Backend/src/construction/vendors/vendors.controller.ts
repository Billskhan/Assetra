import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';
import { RolesGuard } from '../../platform/auth/roles.guard';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { AttachVendorToProjectDto } from './dto/attach-vendor-to-project.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findAll(@CurrentUser() user: AuthUser, @Query('projectId') projectId?: string) {
    if (!projectId) {
      return this.vendorsService.findAll(user);
    }

    const parsedProjectId = Number(projectId);
    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      throw new BadRequestException('Invalid projectId.');
    }

    return this.vendorsService.findAll(user, parsedProjectId);
  }

  @Get(':vendorId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER, Role.STAKEHOLDER)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('vendorId', ParseIntPipe) vendorId: number
  ) {
    return this.vendorsService.findOne(vendorId, user);
  }

  @Post(':vendorId/projects/:projectId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  attachToProject(
    @CurrentUser() user: AuthUser,
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() _dto: AttachVendorToProjectDto
  ) {
    return this.vendorsService.attachToProject(vendorId, projectId, user);
  }
}
