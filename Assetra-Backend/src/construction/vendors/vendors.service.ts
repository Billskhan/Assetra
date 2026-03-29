import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Role, Vendor } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateVendorDto, user: AuthUser): Promise<Vendor> {
    return this.prisma.vendor.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        isGlobal: dto.isGlobal,
        organizationId: user.organizationId
      }
    });
  }

  findAll(user: AuthUser): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        organizationId: user.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async attachToProject(vendorId: number, projectId: number, user: AuthUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: user.organizationId
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return this.prisma.projectVendor.upsert({
      where: {
        projectId_vendorId: {
          projectId,
          vendorId
        }
      },
      update: {},
      create: {
        projectId,
        vendorId
      }
    });
  }

  async findByProject(projectId: number, user: AuthUser): Promise<Vendor[]> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      },
      include: {
        projectUsers: { select: { userId: true } }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canAccess =
      user.role === Role.ADMIN ||
      user.role === Role.PROJECT_MANAGER ||
      project.projectUsers.some((pu) => pu.userId === user.userId);

    if (!canAccess) {
      throw new ForbiddenException('Project access denied');
    }

    const links = await this.prisma.projectVendor.findMany({
      where: {
        projectId
      },
      include: {
        vendor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return links.map((link) => link.vendor);
  }
}
