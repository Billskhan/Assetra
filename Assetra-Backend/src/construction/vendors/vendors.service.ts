import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES } from '../../common/roles';
import { CreateVendorDto } from './dto/create-vendor.dto';

const VENDOR_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isGlobal: true,
  createdAt: true
};

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendorDto, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to create vendors.');
    }

    const name = dto.name.trim();
    const email = dto.email?.trim();
    const phone = dto.phone?.trim();

    const existing = await this.prisma.vendor.findFirst({
      where: {
        organizationId: user.organizationId,
        name: { equals: name, mode: 'insensitive' }
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException('Vendor name already exists.');
    }

    return this.prisma.vendor.create({
      data: {
        organizationId: user.organizationId,
        name,
        email: email && email.length > 0 ? email : null,
        phone: phone && phone.length > 0 ? phone : null,
        isGlobal: dto.isGlobal ?? false
      },
      select: VENDOR_SELECT
    });
  }

  async findAll(user: AuthUser, projectId?: number) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Vendor access denied.');
    }

    if (projectId !== undefined) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, organizationId: user.organizationId },
        select: { id: true }
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      // When filtering by projectId, return only vendors attached to that project.
      return this.prisma.vendor.findMany({
        where: {
          organizationId: user.organizationId,
          projectVendors: { some: { projectId } }
        },
        orderBy: { createdAt: 'desc' },
        select: VENDOR_SELECT
      });
    }

    return this.prisma.vendor.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      select: VENDOR_SELECT
    });
  }

  async findOne(vendorId: number, user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Vendor access denied.');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, organizationId: user.organizationId },
      select: {
        ...VENDOR_SELECT,
        projectVendors: { select: { projectId: true } }
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    return vendor;
  }

  async attachToProject(vendorId: number, projectId: number, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to attach vendors.');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return this.prisma.projectVendor.upsert({
      where: {
        projectId_vendorId: {
          projectId,
          vendorId
        }
      },
      update: {
        organizationId: user.organizationId
      },
      create: {
        organizationId: user.organizationId,
        projectId,
        vendorId
      },
      select: {
        projectId: true,
        vendorId: true
      }
    });
  }
}
