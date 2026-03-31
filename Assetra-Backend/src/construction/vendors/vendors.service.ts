import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Prisma, Role, Vendor } from '@prisma/client';

type VendorOutstandingSummary = {
  vendorId: number;
  vendorName: string;
  totalTransactionAmount: number;
  totalPaidAmount: number;
  totalBalance: number;
};

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendorDto, user: AuthUser): Promise<Vendor> {
    const { projectId } = dto;

    if (!projectId) {
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

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          organizationId: user.organizationId
        },
        select: { id: true }
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const vendor = await tx.vendor.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          isGlobal: dto.isGlobal,
          organizationId: user.organizationId
        }
      });

      await tx.projectVendor.create({
        data: {
          projectId,
          vendorId: vendor.id
        }
      });

      return vendor;
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
      },
      select: {
        id: true,
        name: true,
        organizationId: true
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        name: true,
        organizationId: true
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (project.organizationId !== vendor.organizationId) {
      throw new ForbiddenException('Cross-organization attachment is not allowed');
    }

    const existing = await this.prisma.projectVendor.findUnique({
      where: {
        projectId_vendorId: {
          projectId,
          vendorId
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    if (existing) {
      return {
        success: true,
        alreadyAttached: true,
        attachment: existing,
        project,
        vendor
      };
    }

    try {
      const attachment = await this.prisma.projectVendor.create({
        data: {
          projectId,
          vendorId
        },
        select: {
          id: true,
          createdAt: true
        }
      });

      return {
        success: true,
        alreadyAttached: false,
        attachment,
        project,
        vendor
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          success: true,
          alreadyAttached: true,
          project,
          vendor
        };
      }

      throw error;
    }
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

  async getOutstandingSummary(user: AuthUser): Promise<VendorOutstandingSummary[]> {
    const vendors = await this.prisma.vendor.findMany({
      where: {
        organizationId: user.organizationId
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const grouped = await this.prisma.transaction.groupBy({
      by: ['vendorId'],
      where: {
        organizationId: user.organizationId
      },
      _sum: {
        totalAmount: true,
        paidAmount: true,
        balance: true
      }
    });

    const byVendorId = new Map(
      grouped.map((row) => [
        row.vendorId,
        {
          totalTransactionAmount: Number(row._sum.totalAmount ?? 0),
          totalPaidAmount: Number(row._sum.paidAmount ?? 0),
          totalBalance: Number(row._sum.balance ?? 0)
        }
      ])
    );

    return vendors.map((vendor) => {
      const summary = byVendorId.get(vendor.id);

      return {
        vendorId: vendor.id,
        vendorName: vendor.name,
        totalTransactionAmount: summary?.totalTransactionAmount ?? 0,
        totalPaidAmount: summary?.totalPaidAmount ?? 0,
        totalBalance: summary?.totalBalance ?? 0
      };
    });
  }
}
