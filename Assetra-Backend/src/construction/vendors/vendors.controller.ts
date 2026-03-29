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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { RolesGuard } from '../../platform/auth/roles.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post()
  create(@Body() dto: CreateVendorDto, @CurrentUser() user: AuthUser) {
    return this.vendorsService.create(dto, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.vendorsService.findAll(user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post(':vendorId/projects/:projectId')
  attachToProject(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.vendorsService.attachToProject(vendorId, projectId, user);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.MANAGER)
  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.vendorsService.findByProject(projectId, user);
  }
}
